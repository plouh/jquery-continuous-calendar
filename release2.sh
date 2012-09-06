#!/bin/bash
java -classpath src/lib/js.jar:src/lib/compiler.jar org.mozilla.javascript.tools.shell.Main src/lib/r.js main.js 
#node src/lib/r.js main.js