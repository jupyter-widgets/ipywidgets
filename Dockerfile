FROM andrewosh/binder-base

# for use with mybinder.org

MAINTAINER Raymond Yee  <raymond.yee@gmail.com>

USER root
COPY . $HOME/
RUN ls *
RUN pip install -v -e .
