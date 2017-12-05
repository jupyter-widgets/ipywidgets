set -ex

# Test ipywidgets against the spec documentation by generating the spec and comparing
python ./packages/schema/generate-spec.py > spec.md
diff -u ./packages/schema/jupyterwidgetmodels.latest.md ./spec.md
