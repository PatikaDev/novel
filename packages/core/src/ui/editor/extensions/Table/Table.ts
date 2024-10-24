import TiptapTable from '@tiptap/extension-table';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { findTable, getCellsInRow } from './utils';
import { columnResizing } from '@tiptap/pm/tables';

export const Table = TiptapTable.extend({
  addProseMirrorPlugins() {
    const { isEditable } = this.editor;

    return [
      columnResizing(),
      new Plugin({
        props: {
          decorations: (state, ...rest) => {
            if (!isEditable) {
              return DecorationSet.empty;
            }

            const { doc, selection } = state;

            const cells = getCellsInRow(0)(selection);
            const decorations: Decoration[] = [];
            if (cells) {
              decorations.push(
                Decoration.widget(cells[0].pos + 1, () => {
                  const deleteButton = document.createElement('button');
                  deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`;
                  deleteButton.className =
                    'novel-absolute novel-border rounded  novel-p-1 novel--left-10 ';
                  deleteButton.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    const table = findTable(selection);
                    this.editor.chain().setNodeSelection(table?.pos).deleteSelection().run();
                  });

                  return deleteButton;
                }),
              );
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

export default Table;
