# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

""" A module used to serialize objects.

Serialization is done using the `serialize()` method of the `Serializer` class.

The serialization is performed using subclasses of BaseSerializer, implemented
in the urth.util.serializers package. Each BaseSerializer subclass defines
the serialization process for one class. If a variable's class matches the
class represented by a serializer, that serializer will be used to serialize
the variable.

New serializers are registered by declaring a new subclass of BaseSerializer
in the urth.util.serializers package.

"""

import urth.util.serializers as serializers
import urth.util.serializer_registrar as sr


class Serializer():
    """ A class used to serialize objects.

    Examples
    --------
    >>> obj = 3.0
    >>> s = Serializer()
    >>> print(s.serialize(obj))
    """

    # serializer_map maps class names to serialization functions
    serializer_map = {}

    def __init__(self):
        self.serializer_map = self._load_serializers()

    def serialize(self, obj, **kwargs):
        """Serialize the given object using registered serializers.

        Parameters
        ----------
        obj : object
            The object to serialize

        **kwargs : dict
            Allows for extra parameters to be sent to the serializer

        Returns
        -------
        obj
            The object in serialized form

        """

        for klass in self.serializer_map.keys():
            if isinstance(obj, klass):
                return self.serializer_map[klass](obj, **kwargs)

        # If no serializer exists for this object's class, return the object.
        return obj

    def _load_serializers(self):
        """Generates a mapping of class name to serialization function.

        Returns
        -------
        serializer_map : dict
            A map of classes to serialization functions.

        """
        return sr.serializer_map

    def _valid_serializer(self, cls):
        """Checks whether a class name represents a valid serializer class.

        Parameters
        ----------
        cls : class
            The class to check

        Returns
        -------
        boolean
            True if `cls` is a valid serializer class
        """
        return (issubclass(cls, serializers.BaseSerializer)
                and cls != serializers.BaseSerializer
                and cls.check_packages())
