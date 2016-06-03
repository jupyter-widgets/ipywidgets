# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from urth.util.serializer_registrar import SerializerRegistrar

class BaseSerializer(object, metaclass=SerializerRegistrar):
    """
    An abstract base class for serializers.

    Each class extending BaseSerializer should serialize a single class,
    whose name is returned by klass().

    Adding a new subclass of BaseSerializer in this package will automatically
    register the subclass for use by the Serializer.
    """

    @staticmethod
    def klass():
        """The class that this serializer can serialize.

        Returns
        -------
        class
            class object representing the class that this serializer will
            serialize
        """
        pass

    @staticmethod
    def serialize(obj, **kwargs):
        """Serializes an object, assumed to have the class returned by `klass()`

        Parameters
        ----------
        obj : object
            The object to serialize. `obj`'s class will be equal to the class
            returned by `klass()`

        **kwargs : dict
            Allows for extra parameters to be sent to the serializer

        Returns
        -------
        obj
            The object in serialized form.
        """
        pass

    @staticmethod
    def check_packages():
        """Serialization may require using external packages.

        Override this function to check whether the packages needed
        to serialize this serializer's klass can be imported.

        Returns
        -------
        boolean
            True if necessary packages for serialization can be imported.
        """
        pass