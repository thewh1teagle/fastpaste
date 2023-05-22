import React, { useEffect, useRef, useState } from 'react';
import CodeMirror, { ReactCodeMirrorProps, ReactCodeMirrorRef, useCodeMirror } from '@uiw/react-codemirror';

import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { angular } from '@codemirror/lang-angular';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { json } from '@codemirror/lang-json';
import { less } from '@codemirror/lang-less';
import { lezer } from '@codemirror/lang-lezer';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { sass } from '@codemirror/lang-sass';
import { sql } from '@codemirror/lang-sql';
import { vue } from '@codemirror/lang-vue';
import { wast } from '@codemirror/lang-wast';
import { xml } from '@codemirror/lang-xml';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { lineNumbers } from '@codemirror/view'
import { useLocation } from '@remix-run/react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from 'codemirror';


export const languageMap: Record<string, any> = {
  'angular': angular,
  'cpp': cpp,
  'css': css,
  'html': html,
  'java': java,
  'javascript': javascript,
  'json': json,
  'less': less,
  'lezer': lezer,
  'markdown': markdown,
  'php': php,
  'python': python,
  'rust': rust,
  'sass': sass,
  'sql': sql,
  'vue': vue,
  'wast': wast,
  'xml': xml
};

interface EditorProps {
  onSelectLine?: (arg: number) => void
  initialLine?: number,
  options: ReactCodeMirrorProps
}

export default function Editor(props: EditorProps) {

  const ref = React.useRef<any>();
  const scrolledRef = useRef(false)
  var extensions = []
  if (props.options.lang && languageMap[props.options.lang]) {
    const langaugeMode = languageMap[props.options.lang]
    extensions.push(langaugeMode())
  }

  const lineNumbersExtension = lineNumbers({
    domEventHandlers: {
      click(view, line, event) {
        const lineNumber = view.state.doc.lineAt(line.from).number
        if (props.onSelectLine) {
          props?.onSelectLine(lineNumber)
          const position = view.state.doc.line(lineNumber)
          view.dispatch({ selection: { anchor: position.from }, scrollIntoView: true })
        }
        return true
      }
    }
  })
  extensions.push(lineNumbersExtension)


  function refCallback(editor: ReactCodeMirrorRef) {
    // workround for bug in the library where editor.state and editor.view are undefined
    if (!ref.current?.editor && editor?.editor && editor?.state && editor?.view) {
      if (props.initialLine) {
        const position = editor?.view.state.doc.line(props.initialLine!)
        editor?.view.dispatch({ selection: { anchor: position.from }, scrollIntoView: true })

      }
      ref.current = editor
    }
  }


  return (
    <CodeMirror
      ref={refCallback}
      height={"calc(100vh - 3.5rem)"}
      theme={vscodeDark}
      extensions={extensions}
      placeholder='Paste your code here...'
      {...props.options}
      className={`editor ${props.options.readOnly ? 'readonly' : ''} ${props.onSelectLine ? 'lineClickable' : ''}`}
    />
  )

}