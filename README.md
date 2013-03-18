jsonViewer
==========

The intention is that this knockout binding will help you debug your knockout application when it all goes wrong.

usage
=====

To use this just add these files to the head of your page

    <link href="jsonViewer.css" rel="stylesheet" />
    <script src="jsonViewer.js"></script>
  
And then you have access to the jsonViewer binding. You can apply it to any property on your view model, even the $root

    <div data-bind="jsonViewer: $root"></div>
  
This will output the object to the page, simple.
