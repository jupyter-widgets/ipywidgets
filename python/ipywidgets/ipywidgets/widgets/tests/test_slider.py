import playwright.async_api
from IPython.display import display


def center(locator):
    box = locator.bounding_box()
    x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    return x, y


def test_slider_tap(ipywidgets_runner, page_session: playwright.sync_api.Page):
    def kernel():
        import ipywidgets as widgets

        slider = widgets.IntSlider(
            continuous_update=False,
        )
        text = widgets.HTML(value="Nothing happened")

        def echo(change):
            if change["new"] > 0:
                text.value = "slider is greater than 0"
            else:
                text.value = "slider is 0"

        slider.observe(echo, names="value")
        slider.add_class("slider-test")
        text.add_class("text-test")
        display(slider)
        display(text)

    ipywidgets_runner(kernel)
    text = page_session.locator(".text-test")
    slider = page_session.wait_for_selector(".slider-test")
    x, y = center(slider)
    page_session.mouse.click(x, y)
    text.locator("text=slider is greater than 0").wait_for()
