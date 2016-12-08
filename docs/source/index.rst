ipywidgets
==========

.. ipywidgets-setup::

	from ipywidgets import VBox, jsdlink, IntSlider, Button

.. ipywidgets-display::

	s1, s2 = IntSlider(max=200, value=100), IntSlider(value=40)
	b = Button(icon='legal')
	jsdlink((s1, 'value'), (s2, 'max'))
	VBox([s1, s2, b])

