const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+/;

module.exports = function ({ types: t }) {
  const stringOrIdentifier = (val) => {
    return /^['"`].*['"`]$/.test(val)
      ? t.stringLiteral(val.replace(/^['"`]/, "").replace(/['"`]$/, ""))
      : t.identifier(val);
  };

  const parseReferenceTokens = (referenceLine) => {
    const refParts = referenceLine.split(" ");
    const type = refParts[0];
    const args = refParts.slice(1);

    if (type === "_") {
      const possibleLeaf = args.join(" ");
      if (!/=/.test(possibleLeaf)) {
        return { type: "_", value: stringOrIdentifier(possibleLeaf) };
      }
    }

    const parsedArgs = args.map((arg) => {
      const [k, v] = arg.split("=");
      const structuredValue = stringOrIdentifier(v);

      return t.objectProperty(t.stringLiteral(k), structuredValue);
    });

    return { type: type, args: parsedArgs, children: [] };
  };

  const genTypeExpression = (node) => {
    if (node.type === "_") {
      return node.value;
    }

    return t.callExpression(
      t.memberExpression(t.identifier("React"), t.identifier("createElement")),
      [
        /^[A-Z]/.test(node.type[0])
          ? t.identifier(node.type)
          : t.stringLiteral(node.type),
        t.objectExpression([
          ...node.args,
          t.objectProperty(
            t.stringLiteral("children"),
            t.arrayExpression(node.children.map(genTypeExpression))
          ),
        ]),
      ]
    );
  };

  const buildGrandmasReference = (commentLineTokens) => {
    const grandmasReference = {};

    if (
      commentLineTokens[0].loc.start.line === 1 &&
      commentLineTokens[0].value === "👵📚"
    ) {
      let tokenI = 1;
      while (
        commentLineTokens[tokenI] &&
        commentLineTokens[tokenI].loc.start.line === tokenI + 1
      ) {
        const line = commentLineTokens[tokenI].value;
        const k = emojiRegex.exec(line)[0];
        const v = line.slice(line.indexOf(k) + k.length + 1).trim();

        grandmasReference[k] = parseReferenceTokens(v);

        tokenI++;
      }
    }

    return grandmasReference;
  };

  const buildGrandmasRecipe = (commentBlockTokens) => {
    const lineToComments = {};
    commentBlockTokens.forEach((token) => {
      lineToComments[token.loc.start.line] = {
        value: token.value,
        start: token.start,
      };
    });

    return lineToComments;
  };

  const cookRecipe = (recipe, grandmasReference) => {
    const trimmedRecipe = recipe.replace(/^\n*/, "").replace(/\s*$/, "");
    const recipeByLine = trimmedRecipe.split("\n");
    const initialIndent = /^\s*/.exec(recipeByLine[0])[0];
    const initialIndentMatcher = new RegExp("^" + initialIndent);
    const normalRecipeByLine = recipeByLine.map((line) =>
      line.replace(initialIndentMatcher, "")
    );

    const rootNode = grandmasReference[normalRecipeByLine[0]];
    const nodeFocusStack = [{ indent: 0, node: rootNode }];
    for (let i = 1; i < normalRecipeByLine.length; i++) {
      const recipeLine = normalRecipeByLine[i];
      const currentIndent = /^\s*/.exec(recipeLine)[0];

      if (currentIndent.length === 0) {
        throw new Error("Invalid indentation. Grandma would be upset.");
      }

      const currentNode = grandmasReference[recipeLine.trim()];
      // we only want to assign to a parent, so keep going until we get one
      while (currentIndent.length <= nodeFocusStack[0].indent) {
        nodeFocusStack.shift();
      }
      nodeFocusStack[0].node.children.push(currentNode);
      nodeFocusStack.unshift({
        node: currentNode,
        indent: currentIndent.length,
      });
    }

    return rootNode;
  };

  const GrandmaVisitorInitiator = {
    Program(path) {
      const commentLineTokens = path.parent.comments.filter(
        (token) => token.type === "CommentLine"
      );
      const commentBlockTokens = path.parent.comments.filter(
        (token) => token.type === "CommentBlock"
      );

      if (!commentLineTokens.length || !commentBlockTokens.length) return;

      const grandmasReference = buildGrandmasReference(commentLineTokens);
      const grandmasRecipes = buildGrandmasRecipe(commentBlockTokens);

      path.traverse(GrandmaVisitor, {
        grandmasReference: grandmasReference,
        grandmasRecipes: grandmasRecipes,
      });
    },
  };

  const GrandmaVisitor = {
    StringLiteral(path, state) {
      if (path.node.value === "👵") {
        const recipeRef = state.grandmasRecipes[path.node.loc.start.line];
        const recipeMatches = recipeRef && recipeRef.start > path.node.start;
        if (recipeMatches) {
          const recipe = recipeRef.value;
          const domStruc = cookRecipe(recipe, state.grandmasReference);

          const typeExpression = genTypeExpression(domStruc);

          path.replaceWith(typeExpression);
          // console.log(JSON.stringify(domStruc, null, 2));
        }
      }
    },
  };

  return { visitor: GrandmaVisitorInitiator };
};
