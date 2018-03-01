import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'


const production = !process.env.ROLLUP_WATCH;

export default {
  entry: 'src/PdTableRowSpan.js',
  dest: 'dist/PdTableRowSpan.min.js',
  format: 'umd',
  moduleName: 'PdTableRowSpan',
  globals: {
    jquery: '$'
  },
  external: ['jquery'],//no package
  plugins: [
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    resolve({
      browser: true,
      extensions: ['.js', '.json']
    }), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    babel(),
    production&&uglify({
      output: {
        comments: function(node, comment) {
          var text = comment.value;
          var type = comment.type;
          if (type == "comment2") {
            // multiline comment
            return /@Created|@Name|@GitHub|@Email|@license|@cc_on/i.test(text);
          }
        }
      }
    })
  ],
  sourceMap: true
}
