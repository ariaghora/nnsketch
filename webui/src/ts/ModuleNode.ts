import type { G, Circle, Line } from "@svgdotjs/svg.js";
import type { DrawingBoard } from "./DrawingBoard";

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
    x: number;
    y: number;
    w: number;
    h: number;
    nIn: number;
    nOut: number;
    type: string;
    prevNodes: ModuleNode[];
    nextNodes: ModuleNode[];
    drawingBoardRef: DrawingBoard;
    nodeSVGContainer: G;
    inCircles: Circle[];
    outCircles: Circle[];
    inLinks: ModuleLink[];
    outLinks: ModuleLink[];
    syntaxTree: any;
    varName: string;
    outVarName: string;
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

        // this.varName = createDefaultVarName(this.type, this.drawingBoardRef);
        this.outVarName = setOutVarName(this, this.drawingBoardRef);

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

    drawSVG() {
        // SVG group for the node containing all the elements
        this.nodeSVGContainer = this.drawingBoardRef.editorNodesSVGHolder.group()

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
                this.drawingBoardRef.connectingLine = this.drawingBoardRef.editorNodesSVGHolder.line(0, 0, 0, 0);
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