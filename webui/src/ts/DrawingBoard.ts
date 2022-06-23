import { SVG, G, Container, Line, Circle } from "@svgdotjs/svg.js";
import { ModuleNode } from "./ModuleNode";


export class DrawingBoard {
    drawingBoardSVG: Container;
    editorNodesSVGHolder: G;
    moduleNodes: Array<ModuleNode>;
    lastEventX: number;
    lastEventY: number;
    connectingMode: boolean;
    connectingModeStartNode: ModuleNode;
    connectingModeEndNode: ModuleNode;
    connectingModeStartCircle: Circle;
    connectingModeEndCircle: Circle;
    connectingLine: Line;
    smallGridSize: number;
    syntaxTree: Object;
    layerTypeCounter: Object;
    outputModuleNodes: ModuleNode[];
    inputModuleNodes: ModuleNode[];
    constructor(drawingBoardSelector: string) {
        this.drawingBoardSVG = SVG(drawingBoardSelector);
        this.editorNodesSVGHolder = this.drawingBoardSVG.group();
        this.moduleNodes = [];
        this.lastEventX = 0;
        this.lastEventY = 0;
        this.connectingMode = false;
        this.connectingModeStartNode = null;
        this.connectingModeEndNode = null;
        this.smallGridSize = 12;
        this.syntaxTree = null;
        this.layerTypeCounter = {};
        this.outputModuleNodes = [];
        this.inputModuleNodes = [];

        /**
         * This is supposed to be initialized when an out circle is clicked and
         * connectingMode is set to true.
         */
        this.connectingLine = null;

        /**
         * This rect serves as a click catcher for the drawing board.
         */
        let bg = this.editorNodesSVGHolder.rect(
            window.innerWidth,
            window.innerHeight
        ).fill("var(--drawing-board-background-color)");

        bg.on("click", e => {
            /**
             * Edge case: the user clicks on the out circle, but followed by clicking anywhere
             * on the drawing board. In this case, if start node is set but end node is not,
             * then remove the connecting line.
             */
            if (this.connectingModeStartNode != null && this.connectingModeEndNode == null) {
                this.connectingLine.remove();
            }
            this.unfocusAll()
        })

        this.drawingBoardSVG.on("mousemove", e => {
            let rect = document.getElementById("drawing-board").getBoundingClientRect();

            if (this.connectingMode) {
                let x1 = this.lastEventX - rect.left
                let y1 = this.lastEventY - rect.top
                let x2 = e.clientX - rect.left;
                let y2 = e.clientY - rect.top;

                /**
                 * Plot the preview line, but adding offset at x2 & y2 by 1 is to avoid the
                 * line being drawn on the same point as the mouse pointer, so that the target
                 * circle can be selected without being occluded by the preview line.
                 */
                this.connectingLine.plot(
                    x1,
                    y1,
                    x2 > x1 ? x2 - 1 : x2 + 1,
                    y2 > y1 ? y2 - 1 : y2 + 1
                );
            }
        })

    }

    addModuleNode(name: string, x: number, y: number, nIn: number, nOut: number) {
        let moduleNode = new ModuleNode(name, x, y, nIn, nOut, this);
        this.moduleNodes.push(moduleNode);
    }

    unfocusAll() {
        this.connectingMode = false;
        this.connectingModeStartNode = null;
        this.connectingModeEndNode = null;
        this.connectingModeStartCircle = null;
        this.connectingModeEndCircle = null;
        this.connectingLine = null;
        this.moduleNodes.forEach(moduleNode => {
            moduleNode.unfocus();
        });
    }

}