export function isCodeFile(filename: string) {
  const extensions = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',

    '.json',
    '.html',
    '.css',
    '.scss',
    '.less',
    '.md',
  ];
  return extensions.some((extension) => filename.endsWith(extension));
}
