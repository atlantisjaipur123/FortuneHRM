declare module 'react-beautiful-dnd' {
  import * as React from 'react'

  export interface DropResult {
    draggableId: string
    type: string
    source: {
      droppableId: string
      index: number
    }
    destination?: {
      droppableId: string
      index: number
    } | null
    reason: 'DROP' | 'CANCEL'
    mode?: 'FLUID' | 'SNAP'
    combine?: unknown
  }

  export interface DraggableProvided {
    innerRef: (element?: HTMLElement | null) => any
    draggableProps: React.HTMLAttributes<any>
    dragHandleProps?: React.HTMLAttributes<any>
  }

  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => any
    droppableProps: React.HTMLAttributes<any>
    placeholder?: React.ReactElement | null
  }

  export const DragDropContext: React.ComponentType<{ onDragEnd: (result: DropResult) => void; children?: React.ReactNode }>
  export const Droppable: React.ComponentType<{ droppableId: string; children: (provided: DroppableProvided) => React.ReactNode }>
  export const Draggable: React.ComponentType<{ draggableId: string; index: number; children: (provided: DraggableProvided) => React.ReactNode }>
}


