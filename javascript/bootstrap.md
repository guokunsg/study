# Bootstrap notes
https://www.w3schools.com/bootstrap/default.asp

* Responsive web design: Creating web sites which automatically adjust themselves to look good on all devices, from small phones to large desktops.
* Mobile-first approach  
    `<meta name="viewport" content="width=device-width, initial-scale=1">`  
    * width=device-width: sets the width of the page to follow the screen-width of the device 
    * initial-scale=1: sets the initial zoom level when the page is first loaded by the browser.
* Bootstrap requires a containing element to wrap site contents
    * .container class provides a responsive fixed width container
    * .container-fluid class provides a full width container  
    Sample: `<div class="container-fluid">`
* Bootstrap Grids
    * Bootstrap's grid system allows up to 12 columns across the page. Can group the columns together to create wider columns
    * Grid classes: Screen size: xs < (768px) < sm < (992px) < md < (1200px) < lg  
    * Rules:
        - Rows must be placed within a .container or .container-fluid
        - Use rows to create horizontal groups of columns
        - Content should be placed within columns, and only columns may be immediate children of rows
        - Columns create gutters (gaps between column content) via padding. First and last column with negative padding
        - Grid columns are created by specifying the number of 12 available columns you wish to span.
        - Column widths are in percentage, so they are always fluid and sized relative to their parent element
    * Samples:
    ```
    <div class="col-sm-4"> ... </div>
    <div class="col-sm-3 col-md-6 col-lg-4">....</div>
    ```
    * Note: Bootstrap 4 has 5 grid system (.col-, .col-sm-3, .col-md-3, .col-lg-3, .col-xl-3). Bootstrap 4 has removed the xs from the lowest break point. Therefore, (col-) covers all devices.
* Text/Typography
    * Bootstrap's global default font-size is 14px, with a line-height of 1.428. Applied to `<body>` element and all `<p>`
    * `<h1> - <h6> <small> <mark> <abbr> <blockquote> <dl> <code> <kbd> <pre>`
    * Contextual Colors and Backgrounds: .text-muted, .text-primary, .text-success, .text-info, .text-warning, .text-danger
* Tables
    * Basic: .table, .table-striped, .table-bordered, .table-hover, .table-condensed, 
    * Contextual Classes: can be used to color table rows (`<tr>`) or table cells (`<td>`): .active .success .info .warning .danger
    * Responsive Tables: .table-responsive class scrolls horizontally on small devices (under 768px), no difference on large screen
* Images
    * Rounded corner (.img-rounded), Circle (.img-circle), Thumbnail (.img-thumbnail)
    * Responsive Images: 
        - Responsive images automatically adjust to fit the size of the screen  
        - .img-responsive class applies display: block; and max-width: 100%; and height: auto; to the image:
        - Bootstrap 4 has changes the class for responsive image (.img-fluid).
* Jumbotron (.jumbotron)
    * A big grey box with rounded corners for calling extra attention to some special content or information. 
    * Can be inside or outside .container
* Page Header: .page-header class adds a horizontal line under the heading (+ adds some extra space around the element)
* Wells: .well class adds a rounded border around an element with a gray background color and some padding  
    Small wells (.well-sm) Large wells(.well-lg)
* Alerts
    * Alert box class: "alert alert-success" "alert alert-info" "alert alert-warning" "alert alert-danger"
    * Alert links: Add the alert-link class to any links inside the alert box to create "matching colored links"
    * Add a .alert-dismissible class to the alert container to show a 'X' symbol to close the alert. .fade and .in to have animation
    ```
    <div class="alert alert-success alert-dismissible">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        <strong>Success!</strong> Indicates a successful or positive action.
    </div>
    ```
* Buttons
    * .btn .btn-default .btn-primary .btn-success .btn-info .btn-warning .btn-danger .btn-link  
    * Button classes can be used on an `<a>`, `<button>`, or `<input>` element
    * Button Sizes: .btn-lg .btn-md .btn-sm .btn-xs
    * Block Level Buttons: .btn-block spans the entire width of the parent element
    * Active/Disabled Buttons: .active makes a button appear pressed, and the class .disabled makes a button unclickable
    Sample: `<button type="button" class="btn btn-primary btn-lg">Large</button>`
* Button Groups
    * Use a `<div>` element with class .btn-group to create a button group:
    * .btn-group-lg|sm|xs to size all buttons in the group
    * .btn-group-vertical: Vertical button group
    * .btn-group-justified: span the entire width of the screen
    * Nesting Button Groups & Dropdown Menus: `<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">`
* Glyphicons
    * Bootstrap provides 260 glyphicons from the Glyphicons Halflings set.
    * `<span class="glyphicon glyphicon-name"></span>`
* Badges and Labels
    * Badges are numerical indicators of how many items are associated with a link. .badge class within `<span>` to create badges
    * Labels are used to provide additional information about something. .label-default, .label-primary, .label-success, .label-info, .label-warning or .label-danger, within `<span>` to create a label
* Progress Bars
    * Sample: 
    ```
    <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width:70%">
        <span class="sr-only">70% Complete</span>
    </div>
    </div> 
    ```
    * Colored Progress Bars: .progress-bar-success .progress-bar-info .progress-bar-warning .progress-bar-danger
    * .progress-bar-striped to add stripes to the progress bars
    * .active to animate the progress bar
* Pagination
    * .pagination class to an `<ul>` element
    * .active to let the user know which page he/she is on
    * .disabled if a link for some reason is disabled
    * .pagination-lg for larger blocks or .pagination-sm for smaller blocks
    * .breadcrumb class indicates the current page's location within a navigational hierarchy
* Pager: Pager provides previous and next buttons (links). Add .pager class to an `<ul>` element
* List Groups: .list-group an unordered list with list items  
    Sample: `<ul class="list-group"> <li class="list-group-item"> ... </ul>`
* Panels: a bordered box with some padding around its content  
    .panel .panel-body .panel-heading .panel-footer .panel-group .panel-default .panel-primary ...
* Dropdowns
    * .dropdown class indicates a dropdown menu
    * Sample:
    ```
    <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Dropdown Example
        <span class="caret"></span></button>
        <ul class="dropdown-menu">
            <li><a href="#">HTML</a></li> <li><a href="#">CSS</a></li> <li><a href="#">JavaScript</a></li>
        </ul>
    </div> 
    ```
    * .divider .dropdown-header .disabled .dropdown-menu-right 
    * dropup: expand upwards instead of downwards
* Collapse: .collapse Collapsibles are useful when you want to hide and show large amount of content  
    `<button data-toggle="collapse" data-target="#demo">Collapsible</button>`  
    `<div id="demo" class="collapse">`  
    panel-collapse Accordion
* Tabs and Pills
    * Menu: add the .list-inline class to `<ul>` to create a horizontal menu
    * Tabs: Tabs are created with `<ul class="nav nav-tabs">`
    * Pills: `<ul class="nav nav-pills">`
* Navigation Bar: A navigation bar is a navigation header that is placed at the top of the page.  
    `<nav class="navbar navbar-default"> <ul class="nav navbar-nav"> ... </nav>`
* Forms
    * Wrap labels and form controls in `<div class="form-group">`
    * All textual `<input>`, `<textarea>`, and `<select>` elements with class .form-control have a width of 100%.
    * Vertical form (this is default)
    * Horizontal form: 
        - labels are aligned next to the input field (horizontal) on large and medium screens
        - Add class .form-horizontal to the `<form>` element. Add class .control-label to all `<label>` elements
    * Inline form: .form-inline. All of the elements are inline, left-aligned, and the labels are alongside. (only applies to forms within viewports that are at least 768px wide)
* Inputs: Supports the following form controls: input, textarea, checkbox, radio, select
* Input Groups: 
    * .input-group class is a container to enhance an input by adding an icon, text or a button in front or behind it as a "help text".
    * .input-group-addon class attaches an icon or help text next to the input field.
    * .input-group-btn attaches a button next to an input. This is often used together with a search bar
* Form Control States: focus disabled readonly validation(.has-warning .has-error .has-success) icons(.has-feedback) hidden(.sr-only)
* Media Objects
    * Align media objects (like images or videos) to the left or right of some content. Useful for display blog comments, tweets and so on
    * Sample:
    ```
    <!-- Left-aligned -->
    <div class="media">
        <div class="media-left"> <img src="img_avatar1.png" class="media-object" style="width:60px"> </div>
        <div class="media-body"> <h4 class="media-heading">John Doe</h4> <p>Lorem ipsum...</p> </div>
    </div>
    ```
    * Top, Middle or Bottom Alignment; Nested
* Carousel Plugin: A component for cycling through elements, like a carousel (slideshow).
* Modal Plugin: A dialog box/popup window that is displayed on top of the current page.
* Tooltip Plugin: A small pop-up box that appears when the user moves the mouse pointer over an element
* Popover Plugin: A pop-up box that appears when the user clicks on an element. Similar to tooltips but can contain much more content
* Scrollspy Plugin: Automatically update links in a navigation list based on scroll position
* Affix Plugin: Allows an element to become affixed (locked) to an area on the page.
* Filters: Bootstrap does not have a component that allows filtering. However, we can use jQuery to filter / search for elements.

## Template designs
https://www.w3schools.com/bootstrap/bootstrap_templates.asp
Javascript: https://www.w3schools.com/bootstrap/bootstrap_ref_js_affix.asp























