# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

""" Tests for the function.py module

"""

import unittest

from ..functions import *


class TestFunctions(unittest.TestCase):

    #### convert_args()
    def test_convert_args_int(self):
        """should convert int arguments"""

        args = {'a': '1'}
        spec = {'a': int}

        expected = {'a': 1}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_float(self):
        """should convert float arguments"""

        args = {'a': '1.0'}
        spec = {'a': float}

        expected = {'a': 1.0}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_boolean(self):
        """should convert boolean arguments"""

        args = {'a': 'true'}
        spec = {'a': bool}

        expected = {'a': True}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_string(self):
        """should convert string arguments"""

        args = {'a': 'hello'}
        spec = {'a': str}

        expected = {'a': 'hello'}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_array(self):
        """should convert array arguments"""

        args = {'a': '[1, 2, "3"]'}
        spec = {'a': list}

        expected = {'a': [1, 2, "3"]}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_dict(self):
        """should convert dict arguments"""

        args = {'a': '{ "a": 1, "b": [1,2,3], "c": "hello"}'}
        spec = {'a': dict}

        expected = {'a': { 'a': 1, 'b': [1,2,3], 'c': 'hello'}}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_unsupported(self):
        """should not convert an unsupported type"""
        class Foo:
            def bar(self):
                pass

        args = {'a': "Foo()"}
        spec = {'a': Foo}

        expected = {'a': "Foo()"}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    def test_convert_args_unmatched(self):
        """should throw an exception when the provided value
           does not match the type
        """
        args = {'a': '1.012'}
        spec = {'a': int}

        with self.assertRaises(ValueError):
            convert_args(args, spec)

    def test_convert_args_unmatched_type(self):
        """should throw an exception when the provided value
           does not match the type
        """
        args = {'a': self}
        spec = {'a': int}

        with self.assertRaises(TypeError):
            convert_args(args, spec)

    def test_convert_args_bad_format(self):
        """should throw an exception when the provided value
           representation is incorrectly formatted
        """
        args = {'a': '[1, 2, 3'}
        spec = {'a': list}

        with self.assertRaises(ValueError):
            convert_args(args, spec)

    def test_convert_args_multiple(self):
        """should convert multiple arguments"""
        args = {'a': '1', 'b': 'true', 'c': '[1,2,3]'}
        spec = {'a': int, 'b': bool, 'c': list}

        expected = {'a': 1.0, 'b': True, 'c': [1, 2, 3]}
        actual = convert_args(args, spec)

        self.assertEqual(expected, actual)

    #### parameter_types
    def test_parameter_types_none(self):
        """should return type of None if parameter type is not detectable"""

        def func(x):
            return x

        expected = {'x': type(None)}
        actual = parameter_types(func)

        self.assertEqual(expected, actual)

    def test_parameter_types_default(self):
        """should return type of default value if provided"""
        def func(x=1.0):
            return x

        expected = {'x': float}
        actual = parameter_types(func)

        self.assertEqual(expected, actual)

    #### required_parameter
    def test_required_parameter_no_args(self):
        """should return empty array"""
        def func():
            return 'hello'

        expected = []
        actual = required_parameter(func)

        self.assertEqual(expected, actual)

    def test_required_parameter_args_with_no_default(self):
        """should return all params in an array"""
        def func(a, b, c):
            return a+b+c

        expected = ['a', 'b', 'c']
        actual = required_parameter(func)

        self.assertEqual(expected, actual)

    def test_required_parameter_args_with_no_default_and_longer_names(self):
        """should return all params in an array"""
        def func(foo, bar, baz):
            return foo+bar+baz

        expected = ['foo', 'bar', 'baz']
        actual = required_parameter(func)

        self.assertEqual(expected, actual)

    def test_required_parameter_args_with_all_default(self):
        """should return empty array"""
        def func(a=1, b=2, c=3):
            return a+b+c

        expected = []
        actual = required_parameter(func)

        self.assertEqual(expected, actual)

    def test_required_parameter_args_with_some_default(self):
        """should return only params without default in array"""
        def func(a, b=2, c=3):
            return a+b+c

        expected = ['a']
        actual = required_parameter(func)

        self.assertEqual(expected, actual)

    def test_apply_with_conversion_no_convert(self):
        """shouldn't convert arguments without types and execute the function"""
        def func(a, b=1.0, c=[3]):
            return a

        args = {'a': '1', 'b': '2.0', 'c': '[1, 2, 3]'}

        expected = str
        actual = type(apply_with_conversion(func, args))

        self.assertEqual(expected, actual)

    def test_apply_with_conversion_bad_args(self):
        """should throw an exception if arguments are badly formatted"""
        def func(a, b=1.0, c=[3]):
            return a

        args = {'a': '1', 'b': '2.0', 'c': '{1, 2, 3}'}

        with self.assertRaises(ValueError):
            apply_with_conversion(func, args)