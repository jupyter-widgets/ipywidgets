def jupyterlab_markdown_heading(heading_text):
    """Use JupyterLab-style anchors for a consistent authoring/viewing experience.

    This is defined in an external file as local functions can't be asssigned to
    config values, as they can't be pickled.
    """
    return heading_text.replace(" ", "-")
