## Installation

`git clone https://github.com/sethborden/questions.git && npm install`

Questions uses the bcrypt package which in turn uses node-gyp.  If you're
installing under Windows this sometimes causes issues which can be resolved
(sometimes) by making sure that you have your PYTHONHOME variable pointing to
the right folder.  Go [here](http://www.google.com) for a more in depth
explanation.
