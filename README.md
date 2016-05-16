# Robot Framework language support for Visual Studio Code

This Visual Studio Code extension supports editing .robot files.

Supported features are:

- Syntax highlighting
- Command 'Robot: Search Keyword'

Syntax highlighting is self-explanatory, and only supports files with extension `.robot`.

Keyword Search requires you to generate the documentation xml files for the libraries you are using,
with [liboc](http://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#libdoc).

If the .robot file you are editing has these libary references:

```
Library    Foo
Library    Bar
```

...keyword search will look for files Foo.xml and Bar.xml within the PYTHONPATH (same mechanism as used by RIDE).

