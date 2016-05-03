# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

""" Tests for the function.py module

"""

import unittest

from ..functions import *


class TestFunctions(unittest.TestCase):

    def test_parameter_types_annotation(self):
        """should return annotation if the annotation is a class"""
        def func(x: float):
            return x

        expected = {'x': float}
        actual = parameter_types(func)

        self.assertEqual(expected, actual)

    def test_parameter_types_annotation_not_class(self):
        """should return type of None if the annotation isn't a class"""
        def func(x: (1+1)):
            return x

        expected = {'x': type(None)}
        actual = parameter_types(func)

        self.assertEqual(expected, actual)

    def test_parameter_types_multiple(self):
        """should work for multiple arguments"""
        def func(a, b: int, c=2.0):
            return a

        expected = {'a': type(None), 'b': int, 'c': float}
        actual = parameter_types(func)

        self.assertEqual(expected, actual)

    def test_signature_spec_multiple(self):
        """should work for multiple arguments"""
        def func(a, b: int, c=2.0, d='asdf', e=[1], f={}, g=True):
            return a

        expected = {'a': {'type': "NoneType", 'required': True},
                    'b': {'type': "Number", 'required': True},
                    'c': {'type': "Number", 'value': 2.0},
                    'd': {'type': "String", 'value': 'asdf'},
                    'e': {'type': "Array", 'value': [1]},
                    'f': {'type': "Object", 'value': {}},
                    'g': {'type': "Boolean", 'value': True}}
        actual = signature_spec(func)

        self.assertEqual(expected, actual)

    def test_signature_spec_on_function_with_class_arg(self):
        """should return full path for non-builtin types"""

        class Foo:
            def a(self):
                pass

        def func(a: Foo):
            return a

        expected = {'a': {'type': "{}.{}".format(Foo.__module__, Foo.__name__), 'required': True}}
        actual = signature_spec(func)

        self.assertEqual(expected, actual)

    def test_apply_with_conversion_convert(self):
        """should convert arguments and execute the function"""
        def func(a: int, b=1.0, c=[3]):
            return a + b + sum(c)

        args = {'a': '1', 'b': '2.0', 'c': '[1, 2, 3]'}

        expected = 9.0
        actual = apply_with_conversion(func, args)

        self.assertEqual(expected, actual)

    def test_apply_with_conversion_bad_types(self):
        """should throw an exception if arguments are wrong type"""
        def func(a: int):
            return a

        args = {'a': {}}

        with self.assertRaises(TypeError):
            apply_with_conversion(func, args)

    def test_apply_with_conversion_bad_types2(self):
        """should throw an exception if arguments are wrong type"""
        def func(a: int):
            return a

        args = {'a': '1.23'}

        with self.assertRaises(ValueError):
            apply_with_conversion(func, args)