<script lang="ts">
    import type { ModuleNode } from "src/ts/ModuleNode";
    import type { DrawingBoard } from "src/ts/DrawingBoard";
    import {
        createIdentifier,
        createImportDeclaration,
        createReturnStatement,
        createVariableDeclaration,
        newLine,
        generatePythonCode,
    } from "../ts/Codegen";
    import DrawingBoardSourceOutput from "./DrawingBoardSourceOutput.svelte";

    export let drawingBoard: DrawingBoard;

    let python_code: string;
    const btnGeneratePythonCodeOnClick = function (e: MouseEvent) {
        let inputNodes: ModuleNode[] = [];
        let outputNodes: ModuleNode[] = [];
        let initMethod = {
            type: "ClassMethod",
            name: "__init__",
            params: [],
            body: [],
            returnType: null,
        };
        let forwardMethod = {
            type: "ClassMethod",
            name: "forward",
            params: [],
            body: [],
            returnType: null,
        };
        let pyModule = {
            type: "Program",
            body: [
                createImportDeclaration("torch", [], null, null),
                createImportDeclaration("torch.nn.Functional", [], null, "F"),
                newLine(2),
                {
                    type: "ClassDeclaration",
                    name: "MyModule",
                    superClass: "torch.nn.Module",
                    body: [initMethod, forwardMethod],
                },
            ],
        };
        for (let node of drawingBoard.moduleNodes) {
            if (node.name === "Input") {
                forwardMethod.params.push(
                    createIdentifier(node.varName, "torch.Tensor")
                );
            } else if (node.name === "Conv2d") {
                initMethod.body.push(
                    createVariableDeclaration(
                        "self." + node.varName,
                        "torch.nn.Conv2d(3, 32)"
                    )
                );
            }
        }

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

        // Topological sort to create assignment statements,
        // starting from output nodes
        let visited = {};
        const visit = function (node: ModuleNode) {
            for (let prevNode of node.prevNodes) {
                if (!visited[prevNode.varName]) {
                    visit(prevNode);
                    // If the layer contains learnable parameters,
                    // add it as a class attribute in init method
                    if (prevNode.name === "Conv2d") {
                        forwardMethod.body.push(
                            createVariableDeclaration(
                                prevNode.outVarName,
                                "self." +
                                    prevNode.varName +
                                    "(" +
                                    prevNode.prevNodes[0].outVarName +
                                    ")"
                            )
                        );
                    } else if (prevNode.name === "MaxPool2d") {
                        forwardMethod.body.push(
                            createVariableDeclaration(
                                prevNode.outVarName,
                                "F." +
                                    camelToSnake(prevNode.name) +
                                    "(" +
                                    prevNode.prevNodes[0].outVarName +
                                    ")"
                            )
                        );
                    }
                }
            }
        };

        const outputVarNames = [];
        for (let i = 0; i < drawingBoard.outputModuleNodes.length; i++) {
            let outputNode = drawingBoard.outputModuleNodes[i];
            visit(outputNode);
            const tempOutputVarName = "output_" + (i + 1);
            forwardMethod.body.push(
                createVariableDeclaration(
                    tempOutputVarName,
                    outputNode.prevNodes[0].outVarName
                )
            );
            forwardMethod.body.push(newLine(1));
            outputVarNames.push(tempOutputVarName);
        }
        forwardMethod.body.push(createReturnStatement(outputVarNames));

        python_code = generatePythonCode(pyModule);
        console.log(python_code);
        document.getElementById("source-output").style.display = "block";
    };
</script>

<div id="toolbar">
    <ul>
        <li>
            <span
                id="btn-generate-python-code"
                on:click={btnGeneratePythonCodeOnClick}
            >
                <i class="fas fa-share-from-square" />
            </span>
        </li>
        <li>
            <i class="fas fa-flask-vial" />
        </li>
        <li>
            <i class="fas fa-list" />
        </li>
    </ul>
</div>

<DrawingBoardSourceOutput {python_code} />

<style lang="scss">
    #toolbar {
        position: fixed;
        background-color: rgba(0, 0, 0, 0.5);
        left: calc(50% - 75px);
        top: 50px;
        width: 150px;
        height: 40px;
        color: black;
        font-size: 14px;
        align-items: center;
        z-index: 100;
        border-radius: 4px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
        ul {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            li {
                display: block;
                width: 36px;
                height: 36px;
                color: white;
                font-size: 14px;
                text-align: center;
                line-height: 40px;
                border-radius: 4px;
                cursor: pointer;
                &:hover {
                    background-color: var(--highlight-color-main);
                }
            }
        }
    }
</style>
