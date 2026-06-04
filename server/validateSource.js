import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { KITS_DIR } from './constants.js';
import { safeKit } from './pathSafety.js';

const REACT_JSX_OPTIONS = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: false,
  skipLibCheck: true,
  isolatedModules: true,
};

function loadTsCompilerOptions(cwd, kit) {
  const tsconfigPath = path.join(cwd, KITS_DIR, kit, 'workspace', 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) return null;
  const read = (f) => (f === tsconfigPath ? fs.readFileSync(tsconfigPath, 'utf-8') : fs.readFileSync(f, 'utf-8'));
  const configFile = ts.readConfigFile(tsconfigPath, read);
  if (configFile.error) return null;
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    { ...ts.sys, readFile: read, fileExists: (f) => fs.existsSync(f) },
    path.dirname(tsconfigPath),
  );
  return { ...parsed.options, noEmit: true };
}

function formatDiagnostic(diag) {
  const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  if (diag.file && typeof diag.start === 'number') {
    const { line } = diag.file.getLineAndCharacterOfPosition(diag.start);
    return `line ${line + 1}: ${msg}`;
  }
  return msg;
}

/** Validate TypeScript/TSX/JSX source text; returns first error message or null. */
export function validateSourceContent(content, fileName, compilerOptions) {
  const result = ts.transpileModule(content, {
    compilerOptions: compilerOptions || REACT_JSX_OPTIONS,
    fileName,
    reportDiagnostics: true,
  });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  if (!errors.length) return null;
  return formatDiagnostic(errors[0]);
}

/** Validate a workspace-relative file. Returns { path, error } or null. */
export function validateWorkspaceFile(cwd, resolveWs, kit, relPath) {
  if (!safeKit(kit)) return { path: relPath, error: 'Invalid kit' };
  const ext = path.extname(relPath);
  if (!['.ts', '.tsx', '.jsx'].includes(ext)) return null;

  const full = resolveWs(kit, relPath);
  if (!full || !fs.existsSync(full)) return { path: relPath, error: 'File not found' };

  let content;
  try {
    content = fs.readFileSync(full, 'utf-8');
  } catch (err) {
    return { path: relPath, error: err.message };
  }

  const options = kit === 'angular'
    ? loadTsCompilerOptions(cwd, kit) || REACT_JSX_OPTIONS
    : REACT_JSX_OPTIONS;

  const error = validateSourceContent(content, relPath, options);
  return error ? { path: relPath, error } : null;
}

/** Batch validate paths; returns array of { path, error }. */
export function validateWorkspaceFiles(cwd, resolveWs, kit, paths = []) {
  const parseErrors = [];
  for (const relPath of paths) {
    const err = validateWorkspaceFile(cwd, resolveWs, kit, relPath);
    if (err) parseErrors.push(err);
  }
  return parseErrors;
}
