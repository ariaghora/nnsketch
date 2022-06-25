<script lang="ts">
    import type { ModuleNode } from "src/ts/ModuleNode";
    import type { DrawingBoard } from "src/ts/DrawingBoard";
    import DrawingBoardSourceOutput from "./DrawingBoardSourceOutput.svelte";
    import {
        createIdentifier,
        createImportDeclaration,
        createReturnStatement,
        createVariableDeclaration,
        createClassMethodDeclaration,
        newLine,
        generatePythonCode,
    } from "../ts/Codegen";

    export let drawingBoard: DrawingBoard;

    let generated_python_code: string;

    const btnGeneratePythonCodeOnClick = function (e: MouseEvent) {
        const initMethod = createClassMethodDeclaration(
            "__init__",
            [],
            [],
            null
        );
        const forwardMethod = createClassMethodDeclaration(
            "forward",
            [],
            [],
            null
        );

        const pyModule = {
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
            if (node.type === "Input") {
                /**
                 * If the node is an input node, we need to add it as a parameter to the
                 * forward method.
                 */
                forwardMethod.params.push(
                    createIdentifier(node.varName, "torch.Tensor")
                );
            } else if (node.type === "Conv2d") {
                /**
                 * Generate necessary layers as class properties. If the layer has learnable
                 * parameters (e.g., Conv2d, Linear), they will be generated as class properties.
                 * Otherwise, they will not be generated.
                 */
                initMethod.body.push(
                    createVariableDeclaration(
                        "self." + node.varName,
                        "torch.nn.Conv2d(3, 32)"
                    )
                );
            }
        }

        // Topological sort to create assignment statements,
        // starting from output nodes
        let visited = {};
        const visit = function (node: ModuleNode) {
            for (let prevNode of node.prevNodes) {
                if (!visited[prevNode.varName]) {
                    visit(prevNode);
                    const lhs = prevNode.outVarName;
                    const rhs = prevNode.evalForCodegen();
                    if (lhs == null || rhs == null) {
                        continue;
                    }
                    if (lhs !== rhs) {
                        forwardMethod.body.push(
                            createVariableDeclaration(lhs, rhs)
                        );
                    }
                }
            }
        };

        /**
         * We invoke topological sort starting from output nodes.
         */
        const outputVarNames = [];
        for (let i = 0; i < drawingBoard.outputModuleNodes.length; i++) {
            const outputNode = drawingBoard.outputModuleNodes[i];
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

        generated_python_code = generatePythonCode(pyModule);
        document.getElementById("source-output-bg-overlay").style.display =
            "block";

        // reset all nodes' evaluated flag
        for (let node of drawingBoard.moduleNodes) {
            node.evaluated = false;
        }
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

<DrawingBoardSourceOutput python_code={generated_python_code} />

<style lang="scss">
    #toolbar {
        position: fixed;
        background-color: var(--header-background-color);
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
