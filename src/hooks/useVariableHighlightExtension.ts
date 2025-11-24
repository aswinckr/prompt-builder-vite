import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * Tiptap extension for highlighting variable placeholders like {{variable_name}}
 */
export const VariableHighlightExtension = Extension.create({
  name: 'variableHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variableHighlight'),

        props: {
          decorations(state) {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                const text = node.text;
                const regex = /\{\{([^{}]+)\}\}/g;
                let match;

                while ((match = regex.exec(text)) !== null) {
                  const start = pos + match.index;
                  const end = start + match[0].length;
                  const variableName = match[1];

                  const decoration = Decoration.inline(
                    start,
                    end,
                    {
                      class: 'variable-placeholder',
                      'data-variable': variableName || '',
                    }
                  );

                  decorations.push(decoration);
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});