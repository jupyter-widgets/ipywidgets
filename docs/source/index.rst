{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Final Project - Word Cloud"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "For this project, you'll create a \"word cloud\" from a text by writing a script.  This script needs to process the text, remove punctuation, ignore case and words that do not contain all alphabets, count the frequencies, and ignore uninteresting or irrelevant words.  A dictionary is the output of the `calculate_frequencies` function.  The `wordcloud` module will then generate the image from your dictionary."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "For the input text of your script, you will need to provide a file that contains text only.  For the text itself, you can copy and paste the contents of a website you like.  Or you can use a site like [Project Gutenberg](https://www.gutenberg.org/) to find books that are available online.  You could see what word clouds you can get from famous books, like a Shakespeare play or a novel by Jane Austen. Save this as a .txt file somewhere on your computer.\n",
    "<br><br>\n",
    "Now you will need to upload your input file here so that your script will be able to process it.  To do the upload, you will need an uploader widget.  Run the following cell to perform all the installs and imports for your word cloud script and uploader widget.  It may take a minute for all of this to run and there will be a lot of output messages. But, be patient. Once you get the following final line of output, the code is done executing. Then you can continue on with the rest of the instructions for this notebook.\n",
    "<br><br>\n",
    "**Enabling notebook extension fileupload/extension...**\n",
    "<br>\n",
    "**- Validating: <font color =green>OK</font>**"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 17,
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Requirement already satisfied: wordcloud in /opt/conda/lib/python3.6/site-packages (1.6.0)\n",
      "Requirement already satisfied: pillow in /opt/conda/lib/python3.6/site-packages (from wordcloud) (5.4.1)\n",
      "Requirement already satisfied: matplotlib in /opt/conda/lib/python3.6/site-packages (from wordcloud) (3.0.3)\n",
      "Requirement already satisfied: numpy>=1.6.1 in /opt/conda/lib/python3.6/site-packages (from wordcloud) (1.15.4)\n",
      "Requirement already satisfied: cycler>=0.10 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (0.10.0)\n",
      "Requirement already satisfied: kiwisolver>=1.0.1 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (1.0.1)\n",
      "Requirement already satisfied: pyparsing!=2.0.4,!=2.1.2,!=2.1.6,>=2.0.1 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (2.3.1)\n",
      "Requirement already satisfied: python-dateutil>=2.1 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (2.8.0)\n",
      "Requirement already satisfied: six in /opt/conda/lib/python3.6/site-packages (from cycler>=0.10->matplotlib->wordcloud) (1.12.0)\n",
      "Requirement already satisfied: setuptools in /opt/conda/lib/python3.6/site-packages (from kiwisolver>=1.0.1->matplotlib->wordcloud) (40.8.0)\n",
      "Requirement already satisfied: fileupload in /opt/conda/lib/python3.6/site-packages (0.1.5)\n",
      "Requirement already satisfied: ipywidgets>=5.1 in /opt/conda/lib/python3.6/site-packages (from fileupload) (7.4.2)\n",
      "Requirement already satisfied: traitlets>=4.2 in /opt/conda/lib/python3.6/site-packages (from fileupload) (4.3.2)\n",
      "Requirement already satisfied: notebook>=4.2 in /opt/conda/lib/python3.6/site-packages (from fileupload) (5.7.5)\n",
      "Requirement already satisfied: widgetsnbextension~=3.4.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (3.4.2)\n",
      "Requirement already satisfied: ipython>=4.0.0; python_version >= \"3.3\" in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (7.4.0)\n",
      "Requirement already satisfied: ipykernel>=4.5.1 in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (5.1.0)\n",
      "Requirement already satisfied: nbformat>=4.2.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (4.4.0)\n",
      "Requirement already satisfied: ipython_genutils in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.2->fileupload) (0.2.0)\n",
      "Requirement already satisfied: six in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.2->fileupload) (1.12.0)\n",
      "Requirement already satisfied: decorator in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.2->fileupload) (4.3.2)\n",
      "Requirement already satisfied: tornado<7,>=4.1 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (6.0.2)\n",
      "Requirement already satisfied: pyzmq>=17 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (18.0.1)\n",
      "Requirement already satisfied: nbconvert in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (5.4.1)\n",
      "Requirement already satisfied: jupyter-core>=4.4.0 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (4.4.0)\n",
      "Requirement already satisfied: Send2Trash in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (1.5.0)\n",
      "Requirement already satisfied: terminado>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (0.8.1)\n",
      "Requirement already satisfied: prometheus-client in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (0.6.0)\n",
      "Requirement already satisfied: jinja2 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (2.10)\n",
      "Requirement already satisfied: jupyter-client>=5.2.0 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (5.2.4)\n",
      "Requirement already satisfied: setuptools>=18.5 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (40.8.0)\n",
      "Requirement already satisfied: jedi>=0.10 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.13.3)\n",
      "Requirement already satisfied: pickleshare in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.7.5)\n",
      "Requirement already satisfied: prompt_toolkit<2.1.0,>=2.0.0 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (2.0.9)\n",
      "Requirement already satisfied: pygments in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (2.3.1)\n",
      "Requirement already satisfied: backcall in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.1.0)\n",
      "Requirement already satisfied: pexpect in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (4.6.0)\n",
      "Requirement already satisfied: jsonschema!=2.5.0,>=2.4 in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets>=5.1->fileupload) (3.0.1)\n",
      "Requirement already satisfied: mistune>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.8.4)\n",
      "Requirement already satisfied: entrypoints>=0.2.2 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.3)\n",
      "Requirement already satisfied: bleach in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (3.1.0)\n",
      "Requirement already satisfied: pandocfilters>=1.4.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (1.4.2)\n",
      "Requirement already satisfied: testpath in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.4.2)\n",
      "Requirement already satisfied: defusedxml in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.5.0)\n",
      "Requirement already satisfied: MarkupSafe>=0.23 in /opt/conda/lib/python3.6/site-packages (from jinja2->notebook>=4.2->fileupload) (1.1.1)\n",
      "Requirement already satisfied: python-dateutil>=2.1 in /opt/conda/lib/python3.6/site-packages (from jupyter-client>=5.2.0->notebook>=4.2->fileupload) (2.8.0)\n",
      "Requirement already satisfied: parso>=0.3.0 in /opt/conda/lib/python3.6/site-packages (from jedi>=0.10->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.3.4)\n",
      "Requirement already satisfied: wcwidth in /opt/conda/lib/python3.6/site-packages (from prompt_toolkit<2.1.0,>=2.0.0->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.1.7)\n",
      "Requirement already satisfied: ptyprocess>=0.5 in /opt/conda/lib/python3.6/site-packages (from pexpect->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.6.0)\n",
      "Requirement already satisfied: attrs>=17.4.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets>=5.1->fileupload) (19.1.0)\n",
      "Requirement already satisfied: pyrsistent>=0.14.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets>=5.1->fileupload) (0.14.11)\n",
      "Requirement already satisfied: webencodings in /opt/conda/lib/python3.6/site-packages (from bleach->nbconvert->notebook>=4.2->fileupload) (0.5.1)\n",
      "Requirement already satisfied: ipywidgets in /opt/conda/lib/python3.6/site-packages (7.4.2)\n",
      "Requirement already satisfied: ipython>=4.0.0; python_version >= \"3.3\" in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (7.4.0)\n",
      "Requirement already satisfied: nbformat>=4.2.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (4.4.0)\n",
      "Requirement already satisfied: traitlets>=4.3.1 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (4.3.2)\n",
      "Requirement already satisfied: widgetsnbextension~=3.4.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (3.4.2)\n",
      "Requirement already satisfied: ipykernel>=4.5.1 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (5.1.0)\n",
      "Requirement already satisfied: setuptools>=18.5 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (40.8.0)\n",
      "Requirement already satisfied: jedi>=0.10 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.13.3)\n",
      "Requirement already satisfied: decorator in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (4.3.2)\n",
      "Requirement already satisfied: pickleshare in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.7.5)\n",
      "Requirement already satisfied: prompt_toolkit<2.1.0,>=2.0.0 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (2.0.9)\n",
      "Requirement already satisfied: pygments in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (2.3.1)\n"
     ]
    },
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Requirement already satisfied: backcall in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.1.0)\n",
      "Requirement already satisfied: pexpect in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (4.6.0)\n",
      "Requirement already satisfied: ipython_genutils in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets) (0.2.0)\n",
      "Requirement already satisfied: jsonschema!=2.5.0,>=2.4 in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets) (3.0.1)\n",
      "Requirement already satisfied: jupyter_core in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets) (4.4.0)\n",
      "Requirement already satisfied: six in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.3.1->ipywidgets) (1.12.0)\n",
      "Requirement already satisfied: notebook>=4.4.1 in /opt/conda/lib/python3.6/site-packages (from widgetsnbextension~=3.4.0->ipywidgets) (5.7.5)\n",
      "Requirement already satisfied: tornado>=4.2 in /opt/conda/lib/python3.6/site-packages (from ipykernel>=4.5.1->ipywidgets) (6.0.2)\n",
      "Requirement already satisfied: jupyter-client in /opt/conda/lib/python3.6/site-packages (from ipykernel>=4.5.1->ipywidgets) (5.2.4)\n",
      "Requirement already satisfied: parso>=0.3.0 in /opt/conda/lib/python3.6/site-packages (from jedi>=0.10->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.3.4)\n",
      "Requirement already satisfied: wcwidth in /opt/conda/lib/python3.6/site-packages (from prompt_toolkit<2.1.0,>=2.0.0->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.1.7)\n",
      "Requirement already satisfied: ptyprocess>=0.5 in /opt/conda/lib/python3.6/site-packages (from pexpect->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.6.0)\n",
      "Requirement already satisfied: attrs>=17.4.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets) (19.1.0)\n",
      "Requirement already satisfied: pyrsistent>=0.14.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets) (0.14.11)\n",
      "Requirement already satisfied: nbconvert in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (5.4.1)\n",
      "Requirement already satisfied: prometheus-client in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.6.0)\n",
      "Requirement already satisfied: terminado>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.8.1)\n",
      "Requirement already satisfied: pyzmq>=17 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (18.0.1)\n",
      "Requirement already satisfied: Send2Trash in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (1.5.0)\n",
      "Requirement already satisfied: jinja2 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (2.10)\n",
      "Requirement already satisfied: python-dateutil>=2.1 in /opt/conda/lib/python3.6/site-packages (from jupyter-client->ipykernel>=4.5.1->ipywidgets) (2.8.0)\n",
      "Requirement already satisfied: mistune>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.8.4)\n",
      "Requirement already satisfied: entrypoints>=0.2.2 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.3)\n",
      "Requirement already satisfied: bleach in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (3.1.0)\n",
      "Requirement already satisfied: pandocfilters>=1.4.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (1.4.2)\n",
      "Requirement already satisfied: testpath in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.4.2)\n",
      "Requirement already satisfied: defusedxml in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.5.0)\n",
      "Requirement already satisfied: MarkupSafe>=0.23 in /opt/conda/lib/python3.6/site-packages (from jinja2->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (1.1.1)\n",
      "Requirement already satisfied: webencodings in /opt/conda/lib/python3.6/site-packages (from bleach->nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.5.1)\n",
      "Installing /opt/conda/lib/python3.6/site-packages/fileupload/static -> fileupload\n",
      "Up to date: /home/jovyan/.local/share/jupyter/nbextensions/fileupload/extension.js\n",
      "Up to date: /home/jovyan/.local/share/jupyter/nbextensions/fileupload/widget.js\n",
      "Up to date: /home/jovyan/.local/share/jupyter/nbextensions/fileupload/fileupload/widget.js\n",
      "- Validating: \u001b[32mOK\u001b[0m\n",
      "\n",
      "    To initialize this nbextension in the browser every time the notebook (or other app) loads:\n",
      "    \n",
      "          jupyter nbextension enable fileupload --user --py\n",
      "    \n",
      "Enabling notebook extension fileupload/extension...\n",
      "      - Validating: \u001b[32mOK\u001b[0m\n"
     ]
    }
   ],
   "source": [
    "# Here are all the installs and imports you will need for your word cloud script and uploader widget\n",
    "\n",
    "!pip install wordcloud\n",
    "!pip install fileupload\n",
    "!pip install ipywidgets\n",
    "!jupyter nbextension install --py --user fileupload\n",
    "!jupyter nbextension enable --py fileupload\n",
    "\n",
    "import wordcloud\n",
    "import numpy as np\n",
    "from matplotlib import pyplot as plt\n",
    "from IPython.display import display\n",
    "import fileupload\n",
    "import io\n",
    "import sys"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "Whew! That was a lot. All of the installs and imports for your word cloud script and uploader widget have been completed. \n",
    "<br><br>\n",
    "**IMPORTANT!** If this was your first time running the above cell containing the installs and imports, you will need save this notebook now. Then under the File menu above,  select Close and Halt. When the notebook has completely shut down, reopen it. This is the only way the necessary changes will take affect.\n",
    "<br><br>\n",
    "To upload your text file, run the following cell that contains all the code for a custom uploader widget. Once you run this cell, a \"Browse\" button should appear below it. Click this button and navigate the window to locate your saved text file."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 34,
   "metadata": {},
   "outputs": [
    {
     "data": {
      "application/vnd.jupyter.widget-view+json": {
       "model_id": "0d63d3986f98451a8a80a758fd6c5a6d",
       "version_major": 2,
       "version_minor": 0
      },
      "text/plain": [
       "FileUploadWidget(label='Browse', _dom_classes=('widget_item', 'btn-group'))"
      ]
     },
     "metadata": {},
     "output_type": "display_data"
    },
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Uploaded `project.txt` (1.58 kB)\n"
     ]
    }
   ],
   "source": [
    "# This is the uploader widget\n",
    "\n",
    "def _upload():\n",
    "\n",
    "    _upload_widget = fileupload.FileUploadWidget()\n",
    "\n",
    "    def _cb(change):\n",
    "        global file_contents\n",
    "        decoded = io.StringIO(change['owner'].data.decode('utf-8'))\n",
    "        filename = change['owner'].filename\n",
    "        print('Uploaded `{}` ({:.2f} kB)'.format(\n",
    "            filename, len(decoded.read()) / 2 **10))\n",
    "        file_contents = decoded.getvalue()\n",
    "\n",
    "    _upload_widget.observe(_cb, names='data')\n",
    "    display(_upload_widget)\n",
    "\n",
    "_upload()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "The uploader widget saved the contents of your uploaded file into a string object named *file_contents* that your word cloud script can process. This was a lot of preliminary work, but you are now ready to begin your script. "
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "Write a function in the cell below that iterates through the words in *file_contents*, removes punctuation, and counts the frequency of each word.  Oh, and be sure to make it ignore word case, words that do not contain all alphabets and boring words like \"and\" or \"the\".  Then use it in the `generate_from_frequencies` function to generate your very own word cloud!\n",
    "<br><br>\n",
    "**Hint:** Try storing the results of your iteration in a dictionary before passing them into wordcloud via the `generate_from_frequencies` function."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 53,
   "metadata": {},
   "outputs": [],
   "source": [
    "def calculate_frequencies(file_contents):\n",
    "    # Here is a list of punctuations and uninteresting words you can use to process your text\n",
    "    punctuations = '''!()-[]{};:'\"\\,<>./?@#$%^&*_~'''\n",
    "    uninteresting_words = [\"the\", \"a\", \"to\", \"if\", \"is\", \"it\", \"of\", \"and\", \"or\", \"an\", \"as\", \"i\", \"me\", \"my\", \\\n",
    "    \"we\", \"our\", \"ours\", \"you\", \"your\", \"yours\", \"he\", \"she\", \"him\", \"his\", \"her\", \"hers\", \"its\", \"they\", \"them\", \\\n",
    "    \"their\", \"what\", \"which\", \"who\", \"whom\", \"this\", \"that\", \"am\", \"are\", \"was\", \"were\", \"be\", \"been\", \"being\", \\\n",
    "    \"have\", \"has\", \"had\", \"do\", \"does\", \"did\", \"but\", \"at\", \"by\", \"with\", \"from\", \"here\", \"when\", \"where\", \"how\", \\\n",
    "    \"all\", \"any\", \"both\", \"each\", \"few\", \"more\", \"some\", \"such\", \"no\", \"nor\", \"too\", \"very\", \"can\", \"will\", \"just\"]\n",
    "    \n",
    "    # LEARNER CODE START HERE\n",
    "    result = {}\n",
    "    a = file_contents.split()\n",
    "    for word in a:\n",
    "        if word in uninteresting_words:\n",
    "            pass\n",
    "        else:\n",
    "            for letter in word:\n",
    "                if letter in punctuations:\n",
    "                    letter.replace(punctuations,\"\")\n",
    "            if word not in result.keys():\n",
    "                result[word]=0\n",
    "            else:\n",
    "                result[word]+=1\n",
    "   # print(result)\n",
    "\n",
    "    \n",
    "    #wordcloud\n",
    "    cloud = wordcloud.WordCloud()\n",
    "    cloud.generate_from_frequencies(result)\n",
    "    return cloud.to_array()\n",
    "    "
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "If you have done everything correctly, your word cloud image should appear after running the cell below.  Fingers crossed!"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 54,
   "metadata": {},
   "outputs": [
    {
     "data": {
      "image/png": "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\n",
      "text/plain": [
       "<Figure size 432x288 with 1 Axes>"
      ]
     },
     "metadata": {
      "needs_background": "light"
     },
     "output_type": "display_data"
    }
   ],
   "source": [
    "# Display your wordcloud image\n",
    "\n",
    "myimage = calculate_frequencies(file_contents)\n",
    "plt.imshow(myimage, interpolation = 'nearest')\n",
    "plt.axis('off')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "If your word cloud image did not appear, go back and rework your `calculate_frequencies` function until you get the desired output.  Definitely check that you passed your frequecy count dictionary into the `generate_from_frequencies` function of `wordcloud`. Once you have correctly displayed your word cloud image, you are all done with this project. Nice work!"
   ]
  }
 ],
 "metadata": {
  "coursera": {
   "course_slug": "python-crash-course",
   "graded_item_id": "Z5d28",
   "launcher_item_id": "eSjyd"
  },
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.6.7"
  },
  "widgets": {
   "application/vnd.jupyter.widget-state+json": {
    "state": {},
    "version_major": 2,
    "version_minor": 0
   }
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Final Project - Word Cloud"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "For this project, you'll create a \"word cloud\" from a text by writing a script.  This script needs to process the text, remove punctuation, ignore case and words that do not contain all alphabets, count the frequencies, and ignore uninteresting or irrelevant words.  A dictionary is the output of the `calculate_frequencies` function.  The `wordcloud` module will then generate the image from your dictionary."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "For the input text of your script, you will need to provide a file that contains text only.  For the text itself, you can copy and paste the contents of a website you like.  Or you can use a site like [Project Gutenberg](https://www.gutenberg.org/) to find books that are available online.  You could see what word clouds you can get from famous books, like a Shakespeare play or a novel by Jane Austen. Save this as a .txt file somewhere on your computer.\n",
    "<br><br>\n",
    "Now you will need to upload your input file here so that your script will be able to process it.  To do the upload, you will need an uploader widget.  Run the following cell to perform all the installs and imports for your word cloud script and uploader widget.  It may take a minute for all of this to run and there will be a lot of output messages. But, be patient. Once you get the following final line of output, the code is done executing. Then you can continue on with the rest of the instructions for this notebook.\n",
    "<br><br>\n",
    "**Enabling notebook extension fileupload/extension...**\n",
    "<br>\n",
    "**- Validating: <font color =green>OK</font>**"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 17,
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Requirement already satisfied: wordcloud in /opt/conda/lib/python3.6/site-packages (1.6.0)\n",
      "Requirement already satisfied: pillow in /opt/conda/lib/python3.6/site-packages (from wordcloud) (5.4.1)\n",
      "Requirement already satisfied: matplotlib in /opt/conda/lib/python3.6/site-packages (from wordcloud) (3.0.3)\n",
      "Requirement already satisfied: numpy>=1.6.1 in /opt/conda/lib/python3.6/site-packages (from wordcloud) (1.15.4)\n",
      "Requirement already satisfied: cycler>=0.10 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (0.10.0)\n",
      "Requirement already satisfied: kiwisolver>=1.0.1 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (1.0.1)\n",
      "Requirement already satisfied: pyparsing!=2.0.4,!=2.1.2,!=2.1.6,>=2.0.1 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (2.3.1)\n",
      "Requirement already satisfied: python-dateutil>=2.1 in /opt/conda/lib/python3.6/site-packages (from matplotlib->wordcloud) (2.8.0)\n",
      "Requirement already satisfied: six in /opt/conda/lib/python3.6/site-packages (from cycler>=0.10->matplotlib->wordcloud) (1.12.0)\n",
      "Requirement already satisfied: setuptools in /opt/conda/lib/python3.6/site-packages (from kiwisolver>=1.0.1->matplotlib->wordcloud) (40.8.0)\n",
      "Requirement already satisfied: fileupload in /opt/conda/lib/python3.6/site-packages (0.1.5)\n",
      "Requirement already satisfied: ipywidgets>=5.1 in /opt/conda/lib/python3.6/site-packages (from fileupload) (7.4.2)\n",
      "Requirement already satisfied: traitlets>=4.2 in /opt/conda/lib/python3.6/site-packages (from fileupload) (4.3.2)\n",
      "Requirement already satisfied: notebook>=4.2 in /opt/conda/lib/python3.6/site-packages (from fileupload) (5.7.5)\n",
      "Requirement already satisfied: widgetsnbextension~=3.4.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (3.4.2)\n",
      "Requirement already satisfied: ipython>=4.0.0; python_version >= \"3.3\" in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (7.4.0)\n",
      "Requirement already satisfied: ipykernel>=4.5.1 in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (5.1.0)\n",
      "Requirement already satisfied: nbformat>=4.2.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets>=5.1->fileupload) (4.4.0)\n",
      "Requirement already satisfied: ipython_genutils in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.2->fileupload) (0.2.0)\n",
      "Requirement already satisfied: six in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.2->fileupload) (1.12.0)\n",
      "Requirement already satisfied: decorator in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.2->fileupload) (4.3.2)\n",
      "Requirement already satisfied: tornado<7,>=4.1 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (6.0.2)\n",
      "Requirement already satisfied: pyzmq>=17 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (18.0.1)\n",
      "Requirement already satisfied: nbconvert in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (5.4.1)\n",
      "Requirement already satisfied: jupyter-core>=4.4.0 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (4.4.0)\n",
      "Requirement already satisfied: Send2Trash in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (1.5.0)\n",
      "Requirement already satisfied: terminado>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (0.8.1)\n",
      "Requirement already satisfied: prometheus-client in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (0.6.0)\n",
      "Requirement already satisfied: jinja2 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (2.10)\n",
      "Requirement already satisfied: jupyter-client>=5.2.0 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.2->fileupload) (5.2.4)\n",
      "Requirement already satisfied: setuptools>=18.5 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (40.8.0)\n",
      "Requirement already satisfied: jedi>=0.10 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.13.3)\n",
      "Requirement already satisfied: pickleshare in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.7.5)\n",
      "Requirement already satisfied: prompt_toolkit<2.1.0,>=2.0.0 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (2.0.9)\n",
      "Requirement already satisfied: pygments in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (2.3.1)\n",
      "Requirement already satisfied: backcall in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.1.0)\n",
      "Requirement already satisfied: pexpect in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (4.6.0)\n",
      "Requirement already satisfied: jsonschema!=2.5.0,>=2.4 in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets>=5.1->fileupload) (3.0.1)\n",
      "Requirement already satisfied: mistune>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.8.4)\n",
      "Requirement already satisfied: entrypoints>=0.2.2 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.3)\n",
      "Requirement already satisfied: bleach in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (3.1.0)\n",
      "Requirement already satisfied: pandocfilters>=1.4.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (1.4.2)\n",
      "Requirement already satisfied: testpath in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.4.2)\n",
      "Requirement already satisfied: defusedxml in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.2->fileupload) (0.5.0)\n",
      "Requirement already satisfied: MarkupSafe>=0.23 in /opt/conda/lib/python3.6/site-packages (from jinja2->notebook>=4.2->fileupload) (1.1.1)\n",
      "Requirement already satisfied: python-dateutil>=2.1 in /opt/conda/lib/python3.6/site-packages (from jupyter-client>=5.2.0->notebook>=4.2->fileupload) (2.8.0)\n",
      "Requirement already satisfied: parso>=0.3.0 in /opt/conda/lib/python3.6/site-packages (from jedi>=0.10->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.3.4)\n",
      "Requirement already satisfied: wcwidth in /opt/conda/lib/python3.6/site-packages (from prompt_toolkit<2.1.0,>=2.0.0->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.1.7)\n",
      "Requirement already satisfied: ptyprocess>=0.5 in /opt/conda/lib/python3.6/site-packages (from pexpect->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets>=5.1->fileupload) (0.6.0)\n",
      "Requirement already satisfied: attrs>=17.4.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets>=5.1->fileupload) (19.1.0)\n",
      "Requirement already satisfied: pyrsistent>=0.14.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets>=5.1->fileupload) (0.14.11)\n",
      "Requirement already satisfied: webencodings in /opt/conda/lib/python3.6/site-packages (from bleach->nbconvert->notebook>=4.2->fileupload) (0.5.1)\n",
      "Requirement already satisfied: ipywidgets in /opt/conda/lib/python3.6/site-packages (7.4.2)\n",
      "Requirement already satisfied: ipython>=4.0.0; python_version >= \"3.3\" in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (7.4.0)\n",
      "Requirement already satisfied: nbformat>=4.2.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (4.4.0)\n",
      "Requirement already satisfied: traitlets>=4.3.1 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (4.3.2)\n",
      "Requirement already satisfied: widgetsnbextension~=3.4.0 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (3.4.2)\n",
      "Requirement already satisfied: ipykernel>=4.5.1 in /opt/conda/lib/python3.6/site-packages (from ipywidgets) (5.1.0)\n",
      "Requirement already satisfied: setuptools>=18.5 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (40.8.0)\n",
      "Requirement already satisfied: jedi>=0.10 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.13.3)\n",
      "Requirement already satisfied: decorator in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (4.3.2)\n",
      "Requirement already satisfied: pickleshare in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.7.5)\n",
      "Requirement already satisfied: prompt_toolkit<2.1.0,>=2.0.0 in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (2.0.9)\n",
      "Requirement already satisfied: pygments in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (2.3.1)\n"
     ]
    },
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Requirement already satisfied: backcall in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.1.0)\n",
      "Requirement already satisfied: pexpect in /opt/conda/lib/python3.6/site-packages (from ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (4.6.0)\n",
      "Requirement already satisfied: ipython_genutils in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets) (0.2.0)\n",
      "Requirement already satisfied: jsonschema!=2.5.0,>=2.4 in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets) (3.0.1)\n",
      "Requirement already satisfied: jupyter_core in /opt/conda/lib/python3.6/site-packages (from nbformat>=4.2.0->ipywidgets) (4.4.0)\n",
      "Requirement already satisfied: six in /opt/conda/lib/python3.6/site-packages (from traitlets>=4.3.1->ipywidgets) (1.12.0)\n",
      "Requirement already satisfied: notebook>=4.4.1 in /opt/conda/lib/python3.6/site-packages (from widgetsnbextension~=3.4.0->ipywidgets) (5.7.5)\n",
      "Requirement already satisfied: tornado>=4.2 in /opt/conda/lib/python3.6/site-packages (from ipykernel>=4.5.1->ipywidgets) (6.0.2)\n",
      "Requirement already satisfied: jupyter-client in /opt/conda/lib/python3.6/site-packages (from ipykernel>=4.5.1->ipywidgets) (5.2.4)\n",
      "Requirement already satisfied: parso>=0.3.0 in /opt/conda/lib/python3.6/site-packages (from jedi>=0.10->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.3.4)\n",
      "Requirement already satisfied: wcwidth in /opt/conda/lib/python3.6/site-packages (from prompt_toolkit<2.1.0,>=2.0.0->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.1.7)\n",
      "Requirement already satisfied: ptyprocess>=0.5 in /opt/conda/lib/python3.6/site-packages (from pexpect->ipython>=4.0.0; python_version >= \"3.3\"->ipywidgets) (0.6.0)\n",
      "Requirement already satisfied: attrs>=17.4.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets) (19.1.0)\n",
      "Requirement already satisfied: pyrsistent>=0.14.0 in /opt/conda/lib/python3.6/site-packages (from jsonschema!=2.5.0,>=2.4->nbformat>=4.2.0->ipywidgets) (0.14.11)\n",
      "Requirement already satisfied: nbconvert in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (5.4.1)\n",
      "Requirement already satisfied: prometheus-client in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.6.0)\n",
      "Requirement already satisfied: terminado>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.8.1)\n",
      "Requirement already satisfied: pyzmq>=17 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (18.0.1)\n",
      "Requirement already satisfied: Send2Trash in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (1.5.0)\n",
      "Requirement already satisfied: jinja2 in /opt/conda/lib/python3.6/site-packages (from notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (2.10)\n",
      "Requirement already satisfied: python-dateutil>=2.1 in /opt/conda/lib/python3.6/site-packages (from jupyter-client->ipykernel>=4.5.1->ipywidgets) (2.8.0)\n",
      "Requirement already satisfied: mistune>=0.8.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.8.4)\n",
      "Requirement already satisfied: entrypoints>=0.2.2 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.3)\n",
      "Requirement already satisfied: bleach in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (3.1.0)\n",
      "Requirement already satisfied: pandocfilters>=1.4.1 in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (1.4.2)\n",
      "Requirement already satisfied: testpath in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.4.2)\n",
      "Requirement already satisfied: defusedxml in /opt/conda/lib/python3.6/site-packages (from nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.5.0)\n",
      "Requirement already satisfied: MarkupSafe>=0.23 in /opt/conda/lib/python3.6/site-packages (from jinja2->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (1.1.1)\n",
      "Requirement already satisfied: webencodings in /opt/conda/lib/python3.6/site-packages (from bleach->nbconvert->notebook>=4.4.1->widgetsnbextension~=3.4.0->ipywidgets) (0.5.1)\n",
      "Installing /opt/conda/lib/python3.6/site-packages/fileupload/static -> fileupload\n",
      "Up to date: /home/jovyan/.local/share/jupyter/nbextensions/fileupload/extension.js\n",
      "Up to date: /home/jovyan/.local/share/jupyter/nbextensions/fileupload/widget.js\n",
      "Up to date: /home/jovyan/.local/share/jupyter/nbextensions/fileupload/fileupload/widget.js\n",
      "- Validating: \u001b[32mOK\u001b[0m\n",
      "\n",
      "    To initialize this nbextension in the browser every time the notebook (or other app) loads:\n",
      "    \n",
      "          jupyter nbextension enable fileupload --user --py\n",
      "    \n",
      "Enabling notebook extension fileupload/extension...\n",
      "      - Validating: \u001b[32mOK\u001b[0m\n"
     ]
    }
   ],
   "source": [
    "# Here are all the installs and imports you will need for your word cloud script and uploader widget\n",
    "\n",
    "!pip install wordcloud\n",
    "!pip install fileupload\n",
    "!pip install ipywidgets\n",
    "!jupyter nbextension install --py --user fileupload\n",
    "!jupyter nbextension enable --py fileupload\n",
    "\n",
    "import wordcloud\n",
    "import numpy as np\n",
    "from matplotlib import pyplot as plt\n",
    "from IPython.display import display\n",
    "import fileupload\n",
    "import io\n",
    "import sys"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "Whew! That was a lot. All of the installs and imports for your word cloud script and uploader widget have been completed. \n",
    "<br><br>\n",
    "**IMPORTANT!** If this was your first time running the above cell containing the installs and imports, you will need save this notebook now. Then under the File menu above,  select Close and Halt. When the notebook has completely shut down, reopen it. This is the only way the necessary changes will take affect.\n",
    "<br><br>\n",
    "To upload your text file, run the following cell that contains all the code for a custom uploader widget. Once you run this cell, a \"Browse\" button should appear below it. Click this button and navigate the window to locate your saved text file."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 34,
   "metadata": {},
   "outputs": [
    {
     "data": {
      "application/vnd.jupyter.widget-view+json": {
       "model_id": "0d63d3986f98451a8a80a758fd6c5a6d",
       "version_major": 2,
       "version_minor": 0
      },
      "text/plain": [
       "FileUploadWidget(label='Browse', _dom_classes=('widget_item', 'btn-group'))"
      ]
     },
     "metadata": {},
     "output_type": "display_data"
    },
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Uploaded `project.txt` (1.58 kB)\n"
     ]
    }
   ],
   "source": [
    "# This is the uploader widget\n",
    "\n",
    "def _upload():\n",
    "\n",
    "    _upload_widget = fileupload.FileUploadWidget()\n",
    "\n",
    "    def _cb(change):\n",
    "        global file_contents\n",
    "        decoded = io.StringIO(change['owner'].data.decode('utf-8'))\n",
    "        filename = change['owner'].filename\n",
    "        print('Uploaded `{}` ({:.2f} kB)'.format(\n",
    "            filename, len(decoded.read()) / 2 **10))\n",
    "        file_contents = decoded.getvalue()\n",
    "\n",
    "    _upload_widget.observe(_cb, names='data')\n",
    "    display(_upload_widget)\n",
    "\n",
    "_upload()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "The uploader widget saved the contents of your uploaded file into a string object named *file_contents* that your word cloud script can process. This was a lot of preliminary work, but you are now ready to begin your script. "
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "Write a function in the cell below that iterates through the words in *file_contents*, removes punctuation, and counts the frequency of each word.  Oh, and be sure to make it ignore word case, words that do not contain all alphabets and boring words like \"and\" or \"the\".  Then use it in the `generate_from_frequencies` function to generate your very own word cloud!\n",
    "<br><br>\n",
    "**Hint:** Try storing the results of your iteration in a dictionary before passing them into wordcloud via the `generate_from_frequencies` function."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 53,
   "metadata": {},
   "outputs": [],
   "source": [
    "def calculate_frequencies(file_contents):\n",
    "    # Here is a list of punctuations and uninteresting words you can use to process your text\n",
    "    punctuations = '''!()-[]{};:'\"\\,<>./?@#$%^&*_~'''\n",
    "    uninteresting_words = [\"the\", \"a\", \"to\", \"if\", \"is\", \"it\", \"of\", \"and\", \"or\", \"an\", \"as\", \"i\", \"me\", \"my\", \\\n",
    "    \"we\", \"our\", \"ours\", \"you\", \"your\", \"yours\", \"he\", \"she\", \"him\", \"his\", \"her\", \"hers\", \"its\", \"they\", \"them\", \\\n",
    "    \"their\", \"what\", \"which\", \"who\", \"whom\", \"this\", \"that\", \"am\", \"are\", \"was\", \"were\", \"be\", \"been\", \"being\", \\\n",
    "    \"have\", \"has\", \"had\", \"do\", \"does\", \"did\", \"but\", \"at\", \"by\", \"with\", \"from\", \"here\", \"when\", \"where\", \"how\", \\\n",
    "    \"all\", \"any\", \"both\", \"each\", \"few\", \"more\", \"some\", \"such\", \"no\", \"nor\", \"too\", \"very\", \"can\", \"will\", \"just\"]\n",
    "    \n",
    "    # LEARNER CODE START HERE\n",
    "    result = {}\n",
    "    a = file_contents.split()\n",
    "    for word in a:\n",
    "        if word in uninteresting_words:\n",
    "            pass\n",
    "        else:\n",
    "            for letter in word:\n",
    "                if letter in punctuations:\n",
    "                    letter.replace(punctuations,\"\")\n",
    "            if word not in result.keys():\n",
    "                result[word]=0\n",
    "            else:\n",
    "                result[word]+=1\n",
    "   # print(result)\n",
    "\n",
    "    \n",
    "    #wordcloud\n",
    "    cloud = wordcloud.WordCloud()\n",
    "    cloud.generate_from_frequencies(result)\n",
    "    return cloud.to_array()\n",
    "    "
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "If you have done everything correctly, your word cloud image should appear after running the cell below.  Fingers crossed!"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 54,
   "metadata": {},
   "outputs": [
    {
     "data": {
      "image/png": "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\n",
      "text/plain": [
       "<Figure size 432x288 with 1 Axes>"
      ]
     },
     "metadata": {
      "needs_background": "light"
     },
     "output_type": "display_data"
    }
   ],
   "source": [
    "# Display your wordcloud image\n",
    "\n",
    "myimage = calculate_frequencies(file_contents)\n",
    "plt.imshow(myimage, interpolation = 'nearest')\n",
    "plt.axis('off')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "If your word cloud image did not appear, go back and rework your `calculate_frequencies` function until you get the desired output.  Definitely check that you passed your frequecy count dictionary into the `generate_from_frequencies` function of `wordcloud`. Once you have correctly displayed your word cloud image, you are all done with this project. Nice work!"
   ]
  }
 ],
 "metadata": {
  "coursera": {
   "course_slug": "python-crash-course",
   "graded_item_id": "Z5d28",
   "launcher_item_id": "eSjyd"
  },
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-pyttgtrgtrshon",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.6.7"
  },
  "widgets": {
   "application/vnd.jupyter.widget-state+json": {
    "state": {},
    "version_major": 2,
    "version_minor": 0
   }
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}
