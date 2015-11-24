## Installation

`git clone https://github.com/sethborden/questions.git && npm install`

Questions uses the [bcrypt](https://github.com/ncb000gt/node.bcrypt.js) package
which in turn uses [node-gyp](https://github.com/nodejs/node-gyp).  If you're
installing under Windows this sometimes causes issues which can be resolved
(sometimes) by making sure that you have your PYTHONHOME variable pointing to
the right folder.  Go [here](https://futurestud.io/blog/how-to-build-nodegyp-to-run-bcrypt-on-windows) for a more in depth
explanation.
