const createVariableDeclaration = function (name: string, value: any) {
    return {
        type: "VariableDeclaration",
        id: {
            type: "Identifier",
            name: name,
        },
        init: {
            value: value,
        },
    };
};

const createIdentifier = function (name: string, dtype: string) {
    return {
        type: "Identifier",
        name: name,
        dtype: dtype,
    };
};

const createReturnStatement = function (value: string[]) {
    return {
        type: "ReturnStatement",
        argument: value,
    };
};

const createClassMethodDeclaration = function (
    name: string,
    params: Object[],
    body: Object[],
    returnType: string
) {
    return {
        type: "ClassMethod",
        name: name,
        params: params,
        body: body,
        returnType: returnType,
    };
}

const createImportDeclaration = function (
    source: string,
    specifiers: any[],
    loc: any,
    alias: any
) {
    return {
        type: "ImportDeclaration",
        source: {
            type: "Literal",
            value: source,
        },
        specifiers: specifiers,
        alias: alias,
    };
};

const newLine = function (n: number) {
    return {
        type: "NewLine",
        n: n,
    };
};

const passStatement = function () {
    return {
        type: "passStatement",
    };
}

const generatePythonCode = function (syntaxTree: any) {
    let code = "";

    const generatePythonCodeUtil = function (
        syntaxTree: any,
        indent: number = 0
    ) {
        let indentStr = "";
        for (let i = 0; i < indent; i++) {
            indentStr += "    ";
        }
        switch (syntaxTree.type) {
            case "Program":
                for (let i = 0; i < syntaxTree.body.length; i++) {
                    generatePythonCodeUtil(syntaxTree.body[i], indent);
                }
                break;
            case "ClassDeclaration":
                code += indentStr + "class " + syntaxTree.name + "(";
                if (syntaxTree.superClass) {
                    code += syntaxTree.superClass;
                }
                code += "):\n";
                for (let i = 0; i < syntaxTree.body.length; i++) {
                    generatePythonCodeUtil(syntaxTree.body[i], indent + 1);
                    code += "\n";
                }
                break;
            case "ClassMethod":
                code += indentStr + "def " + syntaxTree.name + "(";
                // by default we assume that the first parameter is self
                syntaxTree.params.unshift(createIdentifier("self", "self"));
                for (let i = 0; i < syntaxTree.params.length; i++) {
                    code += syntaxTree.params[i].name;
                    if (syntaxTree.params[i].dtype !== "self") {
                        if (syntaxTree.params[i].dtype) {
                            code += ": " + syntaxTree.params[i].dtype;
                        } else {
                            code += ": Any";
                        }
                    }

                    if (i < syntaxTree.params.length - 1) {
                        code += ", ";
                    }
                }
                if (syntaxTree.returnType) {
                    code += ") -> " + syntaxTree.returnType + ":\n";
                } else {
                    code += ") -> None" + ":\n";
                }
                for (let i = 0; i < syntaxTree.body.length; i++) {
                    generatePythonCodeUtil(syntaxTree.body[i], indent + 1);
                }
                if (syntaxTree.body.length === 0) {
                    generatePythonCodeUtil(passStatement(), indent + 1);
                }
                break;
            case "BlockStatement":
                for (let i = 0; i < syntaxTree.body.length; i++) {
                    generatePythonCodeUtil(syntaxTree.body[i], indent + 1);
                }
                break;
            case "VariableDeclaration":
                code += indentStr + syntaxTree.id.name + " = ";
                code += syntaxTree.init.value;
                code += "\n";
                break;
            case "Literal":
                code += syntaxTree.value;
                break;
            case "Identifier":
                code += syntaxTree.name;
                break;
            case "ReturnStatement":
                code += indentStr + "return ";
                for (let i = 0; i < syntaxTree.argument.length; i++) {
                    code += syntaxTree.argument[i];
                    if (i < syntaxTree.argument.length - 1) {
                        code += ", ";
                    }
                }
                break;
            case "ImportDeclaration":
                if (syntaxTree.specifiers.length > 0) {
                    code +=
                        indentStr +
                        "from " +
                        syntaxTree.source.value +
                        " import ";
                    for (let i = 0; i < syntaxTree.specifiers.length; i++) {
                        code += syntaxTree.specifiers[i];
                        if (i < syntaxTree.specifiers.length - 1) {
                            code += ", ";
                        }
                    }
                    code += "\n";
                } else {
                    if (syntaxTree.alias) {
                        code +=
                            indentStr +
                            "import " +
                            syntaxTree.source.value +
                            " as " +
                            syntaxTree.alias +
                            "\n";
                    } else {
                        code +=
                            indentStr +
                            "import " +
                            syntaxTree.source.value +
                            "\n";
                    }
                }
                break;
            case "NewLine":
                for (let i = 0; i < syntaxTree.n; i++) {
                    code += "\n";
                }
                break;
            case "passStatement":
                code += indentStr + "pass\n";
        }
    };
    generatePythonCodeUtil(syntaxTree, 0);
    return code;
};

const getSyntaxTreeBaseTemplate = function () {
    const initMethod = {
        type: "ClassMethod",
        id: {
            type: "Identifier",
            name: "__init__",
        },
        returnType: "None",
        params: [
            createIdentifier("self", "self"),
        ],
        body: [],
    };

    const forwardMethod = {
        type: "ClassMethod",
        id: {
            type: "Identifier",
            name: "forward",
        },
        params: [
            createIdentifier("self", "self"),
            createIdentifier("input", "torch.Tensor"),
        ],
        returnType: "torch.Tensor",
        body: [],
    };

    const mainClass = {
        type: "ClassDeclaration",
        id: {
            type: "Identifier",
            name: "MyModel",
        },
        superClass: null,
        body: [initMethod, forwardMethod],
    };

    const syntaxTree = {
        type: "BlockStatement",
        body: [
            createImportDeclaration("torch", [], null, null),
            newLine(2),
            mainClass,
        ],
    };

    forwardMethod.body.push(
        createVariableDeclaration("conv_1_out", "self.conv_1(input)")
    );
    forwardMethod.body.push(
        createReturnStatement({
            type: "Identifier",
            name: "conv_1_out",
        })
    );

    return syntaxTree;
}


export {
    createVariableDeclaration,
    createIdentifier,
    createReturnStatement,
    createImportDeclaration,
    createClassMethodDeclaration,
    newLine,
    generatePythonCode
};