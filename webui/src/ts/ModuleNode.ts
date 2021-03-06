import type { G, Circle, Line } from "@svgdotjs/svg.js";
import type { DrawingBoard } from "./DrawingBoard";

const LEARNABLE_LAYER_TYPES = [
    "Conv2d",
    "Linear",
    "BatchNorm2d",
    "Dropout",
];

const NONLEARNABLE_LAYER_TYPES = [
    "Flatten",
    "ReLU",
    "Tanh",
    "Sigmoid",
    "Softmax",
    "Softmax2d",
    "LogSoftmax",
    "LogSigmoid",
    "Identity",
    "MaxPool2d",
    "AvgPool2d",
    "AdaptiveAvgPool2d",
    "AdaptiveMaxPool2d",
];

const FUNCTIONAL_LAYER = [
    "Add",
    "Multiply"
]

const camelToSnake = (str: string) => {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] === str[i].toUpperCase()) {
            if (i > 0) {
                result += "_";
            }
        }
        result += str[i].toLowerCase();
    }
    return result;
};
const setOutVarName = function (node: ModuleNode, drawingBoard: DrawingBoard) {
    if (node.type === "Input" || node.type === "Output") {
        return node.varName
    } else {
        return node.varName + "_out"
    }
}

/**
 * This class represents a node in the graph.
 * A node can be a layer type or an operation type.
 */
export class ModuleNode {
    drawingBoardRef: DrawingBoard;
    x: number;
    y: number;
    w: number;
    h: number;
    nIn: number;  // number of incoming dots
    nOut: number;  // number of outgoing dots
    type: string;  // layer type
    varName: string;  // Uniqe name for the node; property, initialized in the constructor
    outVarName: string;  // The uniqe variable name of the node in codegen

    /**
     * Keep track of the next and previous nodes.
     */
    nextNodes: ModuleNode[];
    prevNodes: ModuleNode[];

    /**
     * Keep track links, for state update.
     */
    inLinks: ModuleLink[];
    outLinks: ModuleLink[];

    syntaxTree: any;  // Storing the syntax tree of the node.
    evaluated: boolean;  // To prevent redundant evaluation during codegen

    /**
     * For storing SVG elements.
     */
    nodeSVGContainer: G;
    inCircles: Circle[];
    outCircles: Circle[];
    constructor(type: string, varName: string, x: number, y: number, nIn: number, nOut: number, drawingBoardRef: DrawingBoard) {
        this.x = x;
        this.y = y;
        this.w = 120;
        this.h = 50;
        this.nIn = nIn;
        this.nOut = nOut;
        this.type = type;
        this.varName = varName;

        this.prevNodes = [];
        this.nextNodes = [];
        this.drawingBoardRef = drawingBoardRef;
        this.nodeSVGContainer = null;
        this.inCircles = [];
        this.outCircles = [];
        this.inLinks = [];
        this.outLinks = [];
        this.syntaxTree = null;

        // This is used as the left-hand side of the equation in the code generator.
        this.outVarName = setOutVarName(this, this.drawingBoardRef);

        // This property is to determine if the node is evaluated or not.
        // It is to avoid evaluating the same node twice. If the node is evaluated,
        // then we can simply use outVarName in the code generator.
        this.evaluated = false

        if (this.type == "Input") {
            this.drawingBoardRef.inputModuleNodes.push(this);
        } else if (this.type == "Output") {
            this.drawingBoardRef.outputModuleNodes.push(this);
        }

        this.drawSVG();
    }

    unfocus() {
        this.outCircles.forEach(c => {
            c.stroke("none")
            c.fill("var(--node-output-color)")
        });
    }

    evalForCodegen() {
        if (this.evaluated) {
            return this.outVarName
        } else {
            this.evaluated = true
            const outVarNames = this.prevNodes.map(n => n.outVarName).join(", ")
            if (LEARNABLE_LAYER_TYPES.indexOf(this.type) >= 0) {
                return "self." + this.varName + "(" + outVarNames + ")"
            } else if (NONLEARNABLE_LAYER_TYPES.indexOf(this.type) >= 0) {
                // prevNodes' outVarName, separated by commas
                return "F." + this.varName + "(" + outVarNames + ")"
            } else if (FUNCTIONAL_LAYER.indexOf(this.type) >= 0) {
                return "torch." + camelToSnake(this.type) + "(" + outVarNames + ")"
            }
        }
    }

    drawSVG() {
        // SVG group for the node containing all the elements
        this.nodeSVGContainer = this.drawingBoardRef.baseDrawingLayer.group()

        /**
         * Handle drag and drop events.
         */
        this.nodeSVGContainer.draggable();
        this.nodeSVGContainer.on("dragmove.namespace", e => {
            const { handler, box } = e.detail;
            e.preventDefault();
            let { x, y } = box;

            if (!this.drawingBoardRef.connectingMode) {
                handler.move(
                    Math.floor(x / this.drawingBoardRef.smallGridSize) * this.drawingBoardRef.smallGridSize,
                    Math.floor(y / this.drawingBoardRef.smallGridSize) * this.drawingBoardRef.smallGridSize
                );

                // Update in and out links positions
                this.inLinks.forEach(l => {
                    l.updateLinePosition();
                });
                this.outLinks.forEach(l => {
                    l.updateLinePosition();
                });
            }
        })
        this.nodeSVGContainer.css({ cursor: "move" });


        /**
         *  Rectangle part
         * */
        let rect = this.nodeSVGContainer.rect(this.w, this.h);
        rect.move(this.x, this.y);
        rect.fill("var(--node-background-color)");
        rect.stroke("var(--node-border-color)");

        /**
         *  Node label part
         * */
        let label = this.nodeSVGContainer.text(this.type);
        label.font({
            family: "var(--monospace-font)",
            size: "12px",
            anchor: "middle",
            fill: "var(--node-foreground-color)"
        });
        let labelWidth = label.node.clientWidth;
        let labelHeight = label.node.clientHeight;
        label.move(
            this.x + (this.w - labelWidth) / 2,
            this.y + (this.h - labelHeight) / 2
        );

        function setHoverStyle(circ: Circle, drawingBoardRef: DrawingBoard) {
            // set hover style, when not in connecting mode
            circ.on("mouseover", e => {
                if (!drawingBoardRef.connectingMode) {
                    circ.stroke({ color: "#fff", width: 2 });
                }
            })
            circ.on("mouseout", e => {
                if (!drawingBoardRef.connectingMode) {
                    circ.stroke("none")
                }
            })
        }

        let lengthSegmentIn = this.h / (this.nIn + 1);
        let lengthSegmentOut = this.h / (this.nOut + 1);

        /**
         * In circles
         */
        for (let i = 0; i < this.nIn; i++) {
            let circ = this.nodeSVGContainer.circle(this.drawingBoardRef.smallGridSize)
            circ.fill("var(--node-input-color)")
            circ.css({ cursor: "pointer" });
            setHoverStyle(circ, this.drawingBoardRef)

            circ.on("click", e => {
                e.preventDefault();
                if (this.drawingBoardRef.connectingMode) {
                    if (this.drawingBoardRef.connectingModeStartNode !== this) {
                        /**
                         * Handle succesful linking
                         */
                        this.drawingBoardRef.connectingModeEndNode = this;
                        this.drawingBoardRef.connectingModeEndCircle = circ;

                        const link = new ModuleLink();
                        link.setLinkEndpoints(
                            this.drawingBoardRef.connectingModeStartNode,
                            this.drawingBoardRef.connectingModeEndNode,
                            this.drawingBoardRef.connectingModeStartCircle,
                            this.drawingBoardRef.connectingModeEndCircle,
                            this.drawingBoardRef.connectingLine
                        );

                        this.drawingBoardRef.connectingModeStartNode.outLinks.push(link);
                        this.drawingBoardRef.connectingModeEndNode.inLinks.push(link);

                        // Add start node as one of the children of the end node
                        this.drawingBoardRef.connectingModeEndNode.prevNodes.push(
                            this.drawingBoardRef.connectingModeStartNode
                        );

                        link.updateLinePosition()
                    } else {
                        /**
                         * Handle failed linking
                         */
                        this.drawingBoardRef.connectingLine.remove();
                        console.log("connecting mode start node is the same as end node. Aborting");
                    }
                    this.drawingBoardRef.unfocusAll()
                }

            })
            this.inCircles.push(circ);
            this.inCircles[i].move(
                this.x - this.drawingBoardRef.smallGridSize / 2,
                this.y + lengthSegmentIn * (i + 1) - this.drawingBoardRef.smallGridSize / 2
            );
        }

        /**
         * Out circles
         */
        for (let i = 0; i < this.nOut; i++) {
            let circ = this.nodeSVGContainer.circle(this.drawingBoardRef.smallGridSize)
            circ.fill("var(--node-output-color)")
            circ.css({ cursor: "pointer" });
            setHoverStyle(circ, this.drawingBoardRef);

            circ.on("click", e => {
                e.preventDefault();
                this.drawingBoardRef.unfocusAll()
                circ.fill("var(--node-output-color-selected)")
                circ.stroke({ color: "var(--node-output-stroke-selected)", width: 2 });
                this.drawingBoardRef.connectingMode = true;
                this.drawingBoardRef.connectingModeStartNode = this;

                // set last clicked location based on the clicked circle
                this.drawingBoardRef.lastEventX = e.clientX;
                this.drawingBoardRef.lastEventY = e.clientY;

                // Initialize line SVG in the drawing board reference
                this.drawingBoardRef.connectingLine = this.drawingBoardRef.linkDrawingLayer.line(0, 0, 0, 0);
                this.drawingBoardRef.connectingLine.stroke({ color: "var(--link-color)", width: 2 });
                this.drawingBoardRef.connectingModeStartCircle = circ;
            })

            this.outCircles.push(circ);
            this.outCircles[i].move(
                this.w + this.x - this.drawingBoardRef.smallGridSize / 2,
                this.y + lengthSegmentOut * (i + 1) - this.drawingBoardRef.smallGridSize / 2
            );
        }
    }
}

export class ModuleLink {
    startNode: ModuleNode;
    endNode: ModuleNode;
    startCircle: Circle;
    endCircle: Circle;
    lineSVG: Line;
    constructor() {
        this.startNode = null;
        this.endNode = null;
        this.lineSVG = null;
    }

    setLinkEndpoints(startNode: ModuleNode, endNode: ModuleNode, startCircle: Circle, endCircle: Circle, lineSVG: Line) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.startCircle = startCircle;
        this.endCircle = endCircle;
        this.lineSVG = lineSVG;
    }

    updateLinePosition() {
        this.lineSVG.plot(
            this.startCircle.cx(),
            this.startCircle.cy(),
            this.endCircle.cx(),
            this.endCircle.cy()
        );
    }
}