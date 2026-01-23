import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Image, Code, Quote, Undo, Redo, Download, FileText, Save, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

interface AdvancedTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const AdvancedTextEditor: React.FC<AdvancedTextEditorProps> = ({ value, onChange, placeholder = 'Start typing...', minHeight = '400px' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const exportAsHTML = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>`;
    const footer = '</body></html>';
    const sourceHTML = header + value + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' }
  ];

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="border-b-2 border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap gap-2">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r pr-2">
              {toolbarButtons.slice(0, 3).map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand(btn.command, btn.value)}
                  title={btn.title}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r pr-2">
              {toolbarButtons.slice(3, 5).map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand(btn.command, btn.value)}
                  title={btn.title}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r pr-2">
              {toolbarButtons.slice(5, 8).map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand(btn.command, btn.value)}
                  title={btn.title}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Blocks */}
            <div className="flex gap-1 border-r pr-2">
              {toolbarButtons.slice(8, 10).map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand(btn.command, btn.value)}
                  title={btn.title}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Insert */}
            <div className="flex gap-1 border-r pr-2">
              <Button type="button" size="sm" variant="ghost" onClick={insertLink} title="Insert Link" className="h-8 w-8 p-0">
                <Link className="w-4 h-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={insertImage} title="Insert Image" className="h-8 w-8 p-0">
                <Image className="w-4 h-4" />
              </Button>
            </div>

            {/* History */}
            <div className="flex gap-1 border-r pr-2">
              {toolbarButtons.slice(10, 12).map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand(btn.command, btn.value)}
                  title={btn.title}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Font Size */}
            <select
              onChange={(e) => execCommand('fontSize', e.target.value)}
              className="h-8 px-2 border border-gray-300 rounded text-sm"
            >
              <option value="3">Normal</option>
              <option value="1">Small</option>
              <option value="5">Large</option>
              <option value="7">Huge</option>
            </select>

            {/* Text Color */}
            <input
              type="color"
              onChange={(e) => execCommand('foreColor', e.target.value)}
              className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
              title="Text Color"
            />

            {/* Background Color */}
            <input
              type="color"
              onChange={(e) => execCommand('hiliteColor', e.target.value)}
              className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
              title="Highlight Color"
            />

            {/* Preview Toggle */}
            <Button
              type="button"
              size="sm"
              variant={showPreview ? 'default' : 'ghost'}
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 ml-auto"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          {/* Export Options */}
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
            <Button type="button" size="sm" variant="outline" onClick={exportAsHTML} className="h-8">
              <Download className="w-4 h-4 mr-2" />
              Export HTML
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exportAsText} className="h-8">
              <FileText className="w-4 h-4 mr-2" />
              Export TXT
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exportAsWord} className="h-8">
              <Save className="w-4 h-4 mr-2" />
              Export DOC
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        {!showPreview ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            dangerouslySetInnerHTML={{ __html: value }}
            className="p-6 outline-none prose max-w-none"
            style={{ minHeight }}
            placeholder={placeholder}
          />
        ) : (
          <div className="p-6 bg-gray-50" style={{ minHeight }}>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedTextEditor;
