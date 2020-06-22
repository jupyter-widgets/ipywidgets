"""SingleOutput class.

Represents a widget that can be used to display a single output within the widget area.

"""

import traitlets
from IPython.display import display
from .widget_output import Output

class SingleOutput(Output):
    """Value widget to display a single output.
    
    This widget can capture and display stdout, stderr, and rich output into a value called 'value'.  To use
    it, create an instance of it and display it.
    """

    value = traitlets.Any()

    def __init__(self, value=None, **kwargs):
        """ 
        Initialization of the singleoutput widget
            
        Parameter
        ----------
        value : (type=int) the element we want to show
            
        """
        super().__init__(**kwargs)
        self.value = value

    @traitlets.observe("value")
    def _observe_value(self, change):
        """ 
        Display the current value in a row of widget output area.
        
        Parameter
        ----------
        change: (type=list) check if the new value is modify to the last value.
  
        """
        self.clear_output(wait=True)
        with self:
            display(change["new"])
