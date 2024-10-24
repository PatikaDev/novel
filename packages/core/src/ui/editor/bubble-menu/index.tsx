import { BubbleMenu, BubbleMenuProps, isNodeSelection } from '@tiptap/react';
import { FC, useState } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon } from 'lucide-react';
import { NodeSelector } from './node-selector';
import { ColorSelector } from './color-selector';
import { LinkSelector } from './link-selector';
import { cn } from '@/lib/utils';
import { Table } from '../extensions/Table';

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, 'children'>;

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const items: BubbleMenuItem[] = [
    {
      name: 'bold',
      isActive: () => props.editor.isActive('bold'),
      command: () => props.editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: 'italic',
      isActive: () => props.editor.isActive('italic'),
      command: () => props.editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: 'underline',
      isActive: () => props.editor.isActive('underline'),
      command: () => props.editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: 'strike',
      isActive: () => props.editor.isActive('strike'),
      command: () => props.editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: 'code',
      isActive: () => props.editor.isActive('code'),
      command: () => props.editor.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ state, editor, view, from }) => {
      const { selection } = state;
      const { empty } = selection;

      const domAtPos = view.domAtPos(from).node as HTMLElement;
      const nodeDOM = view.nodeDOM(from) as HTMLElement;
      const node = nodeDOM || domAtPos;
      let container = node;

      while (container && !['TD', 'TH'].includes(container.tagName)) {
        container = container.parentElement!;
      }

      const gripColumnSelected =
        container && container.querySelector && container.querySelector('a.grip-column.selected');

      // don't show bubble menu if:
      // - the selected node is an image
      // - the selection is empty
      // - the selection is a node selection (for drag handles)

      if (editor.isActive('image') || empty || isNodeSelection(selection)) {
        return false;
      }
      return !gripColumnSelected;
    },
    tippyOptions: {
      moveTransition: 'transform 0.15s ease-out',
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsColorSelectorOpen(false);
        setIsLinkSelectorOpen(false);
      },
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className='novel-flex novel-w-fit novel-divide-x novel-divide-stone-200 novel-rounded novel-border novel-border-stone-200 novel-bg-white novel-shadow-xl'
    >
      <NodeSelector
        editor={props.editor}
        isOpen={isNodeSelectorOpen}
        setIsOpen={() => {
          setIsNodeSelectorOpen(!isNodeSelectorOpen);
          setIsColorSelectorOpen(false);
          setIsLinkSelectorOpen(false);
        }}
      />
      <LinkSelector
        editor={props.editor}
        isOpen={isLinkSelectorOpen}
        setIsOpen={() => {
          setIsLinkSelectorOpen(!isLinkSelectorOpen);
          setIsColorSelectorOpen(false);
          setIsNodeSelectorOpen(false);
        }}
      />
      <div className='novel-flex'>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.command}
            className='novel-p-2 novel-text-stone-600 hover:novel-bg-stone-100 active:novel-bg-stone-200'
            type='button'
          >
            <item.icon
              className={cn('novel-h-4 novel-w-4', {
                'novel-text-blue-500': item.isActive(),
              })}
            />
          </button>
        ))}
      </div>
      <ColorSelector
        editor={props.editor}
        isOpen={isColorSelectorOpen}
        setIsOpen={() => {
          setIsColorSelectorOpen(!isColorSelectorOpen);
          setIsNodeSelectorOpen(false);
          setIsLinkSelectorOpen(false);
        }}
      />
    </BubbleMenu>
  );
};
