# Robot Framework language support for Visual Studio Code

This Visual Studio Code extension supports editing .robot files.

Supported features are:

- Syntax highlighting
- Command 'Robot: Search Keyword'

Syntax highlighting is self-explanatory, and only supports files with extension `.robot`.
It's based on [TextMate bundle](https://bitbucket.org/jussimalinen/robot.tmbundle/wiki/Home) by Jussi Malinen.

Keyword Search requires you to generate the documentation xml files for the libraries you are using,
with [libdoc](http://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#libdoc).

If the .robot file you are editing has these libary references:

```
Library    Foo
Library    Bar
```

...keyword search will look for files Foo.xml and Bar.xml within the PYTHONPATH (same mechanism as used by RIDE).

Installation: install from Visual Studio Code marketplace, name of the extension is `robotframework`.

Author: Ville M. Vainio <vivainio@gmail.com>

License: MIT
