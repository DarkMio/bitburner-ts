import * as ts from 'typescript';

interface Replacement {     
    regex: string,
    replace: string
}
export interface PluginOptions {
    replacements?: Replacement[]
}

function rewritePath(importPath: string, replacements: Replacement[]) {
    let importLiteral = importPath;
    // churn through each of the changes
    replacements.forEach(element => {
        const regexp = new RegExp(element.regex);
        if(importLiteral.match(regexp)) {
            importLiteral = importLiteral.replace(regexp, element.replace);
        }
    });
    return importLiteral;
}

function isDynamicImport(node: ts.Node): node is ts.CallExpression {
    return ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
}

export default function myTransformerPlugin(program: ts.Program, opts: PluginOptions) {
    const replacements = opts.replacements || [];
    return {
        after(ctx: ts.TransformationContext) {
            return (sourceFile: ts.SourceFile) => {
                function visitor(node: ts.Node): ts.Node {
                    let importPath: string
                    
                    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
                        const importPathWithQuotes = node.moduleSpecifier.getText(sourceFile)
                        importPath = importPathWithQuotes.substr(1, importPathWithQuotes.length - 2)
                    } else if (isDynamicImport(node)) {
                        const importPathWithQuotes = node.arguments[0].getText(sourceFile)
                        importPath = importPathWithQuotes.substr(1, importPathWithQuotes.length - 2)
                    } else if (
                        ts.isImportTypeNode(node) &&
                        ts.isLiteralTypeNode(node.argument) &&
                        ts.isStringLiteral(node.argument.literal)
                    ) {
                        importPath = node.argument.literal.text // `.text` instead of `getText` bc this node doesn't map to sf (it's generated d.ts)
                    }

                    if (importPath) {
                        const rewrittenPath = rewritePath(importPath, replacements)
                        
                        // Only rewrite relative path
                        if (rewrittenPath !== importPath) {
                            if (ts.isImportDeclaration(node)) {
                              return ctx.factory.updateImportDeclaration(
                                node,
                                node.decorators,
                                node.modifiers,
                                node.importClause,
                                ctx.factory.createStringLiteral(rewrittenPath),
                                undefined
                              );
                            } else if (ts.isExportDeclaration(node)) {
                              return ctx.factory.updateExportDeclaration(
                                node,
                                node.decorators,
                                node.modifiers,
                                node.isTypeOnly,
                                node.exportClause,
                                ctx.factory.createStringLiteral(rewrittenPath),
                                undefined
                              );
                            } else if (isDynamicImport(node)) {
                              return ctx.factory.updateCallExpression(
                                node,
                                node.expression,
                                node.typeArguments,
                                ctx.factory.createNodeArray([
                                  ctx.factory.createStringLiteral(rewrittenPath),
                                ])
                              );
                            } else if (ts.isImportTypeNode(node)) {
                              return ctx.factory.updateImportTypeNode(
                                node,
                                ts.createLiteralTypeNode(
                                  ts.createStringLiteral(rewrittenPath)
                                ),
                                node.qualifier,
                                node.typeArguments,
                                node.isTypeOf
                              );

                            }
                        }
                        return node;
                    }
                    return ts.visitEachChild(node, visitor, ctx)
                }
                return ts.visitEachChild(sourceFile, visitor, ctx)
            }
        }
    }
}