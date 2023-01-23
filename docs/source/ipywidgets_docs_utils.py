import subprocess

def jupyterlab_markdown_heading(heading_text):
    """Use JupyterLab-style anchors for a consistent authoring/viewing experience.

    This _must_ be defined in an external file as local functions can't be asssigned
    to config values, as they can't be pickled.
    """
    return heading_text.replace(" ", "-")

def run_if_needed(args, cwd, skip_if=None):
    print(f"in {cwd}...")
    if skip_if:
        print("... skipping if found:", "\n".join(list(map(str, skip_if))))
        if all(s.exists() for s in skip_if):
            print("...skipping")
            return
    print(">>>", " ".join(args))
    subprocess.check_call(args, cwd=str(cwd))
