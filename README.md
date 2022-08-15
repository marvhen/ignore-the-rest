Ignore the Rest
===============

- **Ignore the Rest** is a VS Code extension that lets you quickly comment or uncomment all code from the cursor to the end of the file.
- It was born of the necessity of quickly ignoring the tail end of a SQL script file, specifically when developing a chain of SQL Server Common-Table-Expressions (CTEs).  It is thus best suited for similar scripting type languages.
- It works by simply selecting everythig below the cursor, invoking the built in **Toggle Line Comment** command, and then restoring the previous selection.
- If multiple cursors/selections are active, it uses the one that is closest to the end of the file to know where to begin commenting.
- It remembers the number of lines last commented and when it it run again that same number of lines is uncommented.  This means you don't necessarily have to be in the same location as when the comments were added.

Keyboard Shortcuts
------------------

- Invoke Ignore the Rest using reflow using `ctrl+shift+/` (default).

**Enjoy!**
