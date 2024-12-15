import os
import ruamel.yaml
import json


from sphinx.application import Sphinx
from sphinx.util.fileutil import copy_asset_file

try:
    from ._version import version as __version__
except ImportError:
    __version__ = "1.0.0"

def copy_buttons(app: Sphinx, exc: None) -> None:
    print("[sphinx-launch-buttons] initialised, adding directories.")

    # Define path to js file 
    current_dir = os.path.dirname(__file__)
    js_file = os.path.join(current_dir, 'static', 'launch_buttons.js')

    if app.builder.format == 'html' and not exc:
        
        # Define paths to data files
        staticdir = os.path.join(app.builder.outdir, '_static')
        launch_buttons_yaml = os.path.join(app.builder.srcdir, '_launch_buttons.yml')
    
        # Convert _launch_buttons.yaml to _launch_buttons.json so it can be read in javascript
        yaml_to_json(launch_buttons_yaml, os.path.join(staticdir, '_launch_buttons.json'))

        # Copy custom.js from static
        copy_asset_file(js_file, staticdir)
        # copy_asset_file(launch_buttons_json, staticdir)
        copy_asset_file(launch_buttons_yaml, staticdir)

# Function to convert yaml to json to prevent mixing of yaml and json for the user.
def yaml_to_json(yaml_file: str, json_file: str) -> None:
    with open(yaml_file, 'r') as ymlfile:
        yaml = ruamel.yaml.YAML(typ='safe')
        data = yaml.load(ymlfile)
        with open(json_file, 'w') as jsonfile:
            json.dump(data, jsonfile, indent=4)

def setup(app: Sphinx) -> dict[str, str]:
    app.add_js_file('launch_buttons.js')
    app.connect('build-finished', copy_buttons)
    return {'parallel_read_safe': True, 'parallel_write_safe': True}
