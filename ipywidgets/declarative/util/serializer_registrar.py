# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# serializer_map maps class names to serialization functions
serializer_map = {}

class SerializerRegistrar(type):
    """
    A metaclass used to register each class extending BaseSerializer.

    Specifically, adds a mapping of class to serialization function defined by
    the subclass of BaseSerializer.
    """
    def __init__(cls, name, bases, attrs):
        if cls.check_packages():
            global serializer_map
            serializer_map[cls.klass()] = cls.serialize