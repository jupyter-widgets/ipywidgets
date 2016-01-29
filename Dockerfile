FROM andrewosh/binder-base

# for use with mybinder.org

MAINTAINER Raymond Yee  <raymond.yee@gmail.com>

USER main
RUN pwd
RUN echo $HOME
RUN ls *
RUN ls /home/andrew/binder/apps/rdhyee-ipywidgets/build/app/repo/*
RUN pip install -v -e .
