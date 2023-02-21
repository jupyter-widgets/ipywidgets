# ipywidgets Changelog

This is a summary of changes in ipywidgets releases. For more detailed information, see the issues and pull requests for the appropriate milestone on [GitHub](https://github.com/jupyter-widgets/ipywidgets).

## 8.0.4

Highlights include:

- Fix: slider change event issue with tapping: [#3597](https://github.com/jupyter-widgets/ipywidgets/pull/3597), [#3617](https://github.com/jupyter-widgets/ipywidgets/pull/3617)
- Fix: unintentional deprecation warnings: [#3648](https://github.com/jupyter-widgets/ipywidgets/pull/3648), [#3650](https://github.com/jupyter-widgets/ipywidgets/pull/3650)
- Fix: registry state lookup failed, making is impossible to create widgets from the frontend: [#3653](https://github.com/jupyter-widgets/ipywidgets/pull/3653)

  8.0.3

---

Highlights include:

- Fix: be backwards compatibel with 7.x, where we re-instroduced `.widget` and `.widget_types` [#3567](https://github.com/jupyter-widgets/ipywidgets/pull/3567)
- Fix: be backwards compatibel with 7.x, revert hold_sync during set_state [#3642](https://github.com/jupyter-widgets/ipywidgets/pull/3642)

## [8.0](https://github.com/jupyter-widgets/ipywidgets/releases/tag/8.0.0)

To see the full list of pull requests and issues, see the [8.0 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/30?closed=1) on GitHub, or the
[full list of changes since 7.x](https://github.com/jupyter-widgets/ipywidgets/compare/7.x...8.0.0). See the [user migration guide](./user_migration_guides.md) for suggestions about migrating your code that uses ipywidgets to 8.0. If you author a custom widget, please see the [custom widget migration guide](./migration_guides.md) for suggestions about migrating your widget to support ipywidgets 8.

### Users

Here are some highlights of user-visible changes in ipywidgets 8.0.

#### Date and time pickers

In addition to the existing DatePicker widget, we now have new DatetimePicker and TimePicker widgets. ([#2715](https://github.com/jupyter-widgets/ipywidgets/pull/2715))

```python
from ipywidgets import VBox, TimePicker, DatetimePicker
VBox([
  TimePicker(description='Time'),
  DatetimePicker(description='Date/Time')
])
```

#### Tags input widget

The new TagsInput widget provides an easy way to collect and manage tags in a widget. You can drag and drop tags to reorder them, limit them to a set of allowed values, or even prevent making duplicate tags. ([#2591](https://github.com/jupyter-widgets/ipywidgets/pull/2591), [#3272](https://github.com/jupyter-widgets/ipywidgets/pull/3272))

```python
from ipywidgets import TagsInput
TagsInput(
    value=['pizza', 'fries'],
    allowed_tags=['pizza', 'fries', 'tomatoes', 'steak'],
    allow_duplicates=False
)
```

Similarly, the new ColorsInput widget provides a way to select colors as tags

```python
from ipywidgets import ColorsInput
ColorsInput(
    value=['red', '#2f6d30'],
    # allowed_tags=['red', 'blue', 'green'],
    # allow_duplicates=False
)
```

#### Stack widget

The new Stack container widget shows only the selected child widget, while other child widgets remain hidden. This can be useful if you want to have a area that displays different widgets depending on some other interaction.

```python
from ipywidgets import Stack, Button, IntSlider, Dropdown, VBox, link
s = Stack([Button(description='Click here'), IntSlider()], selected_index=0)
d = Dropdown(options=['button', 'slider'])
link((dropdown, 'index'), (stacked, 'selected_index'))
VBox([d, s])
```

#### File upload widget

The file upload widget has been overhauled to handle multiple files in a more useful format:

- The `.value` attribute is now a list of dictionaries, rather than a dictionary mapping the uploaded name to the content.
- The contents of each uploaded file is a [memory view](https://docs.python.org/3/library/stdtypes.html#memory-views) in the `.content` key, e.g., `uploader.value[0].content`.
- The `.data` attribute has been removed.
- The `.metadata` attribute has been removed.

See the [user migration guide](./user_migration_guides.md#FileUpload) for details on how to migrate your code.

([#2767](https://github.com/jupyter-widgets/ipywidgets/pull/2767), [#2724](https://github.com/jupyter-widgets/ipywidgets/pull/2724), [#2666](https://github.com/jupyter-widgets/ipywidgets/pull/2666), [#2480](https://github.com/jupyter-widgets/ipywidgets/issues/2480))

#### More styling options

Many style and layout options have been added to core widgets:

- Tooltips are now supported for many core widgets, rather than just a few description tooltips ([#2680](https://github.com/jupyter-widgets/ipywidgets/pull/2680))
  ```python
  from ipywidgets import Button
  Button(description="Click me", tooltip='An action')
  ```
- Borders can be styled independently with the layout's `border_top`, `border_right`, `border_bottom`, `border_left` attributes ([#2757](https://github.com/jupyter-widgets/ipywidgets/pull/2757), [#3269](https://github.com/jupyter-widgets/ipywidgets/pull/3269))
  ```python
  from ipywidgets import Button
  Button(description="Click me", layout={'border_bottom': '3px solid blue'})
  ```
- Descriptions are now plain text by default for security, but you can set them to allow HTML with the `description_allow_html` attribute (HTML content is still sanitized for security). ([#2785](https://github.com/jupyter-widgets/ipywidgets/pull/2785))
  ```python
  from ipywidgets import Text
  Text(description="<b>Name</b>", description_allow_html=True)
  ```
- Many other styling attributes can be set on core widgets, such as font family, size, style, weight, text color, and text decoration. See the table in the documentation for a reference. ([#2728](https://github.com/jupyter-widgets/ipywidgets/pull/2728))
- The SelectionSlider now has a `handle_color` style attribute ([#3142](https://github.com/jupyter-widgets/ipywidgets/pull/3142))
- To control keyboard navigation, widgets can be set to be tabbable or not (i.e., that the tab key will traverse to the widget) ([#2640](https://github.com/jupyter-widgets/ipywidgets/pull/2640))

### Selection container titles

The Accordion, Tab, and Stack widgets now have a `.titles` attribute that you can use to get and set titles from the constructor or as an attribute. ([#2746](https://github.com/jupyter-widgets/ipywidgets/pull/2746), [#3296](https://github.com/jupyter-widgets/ipywidgets/pull/3296), [#3477](https://github.com/jupyter-widgets/ipywidgets/pull/3477))

```python
from ipywidgets import Tab, IntSlider, Text
Tab([IntSlider(), Text()], titles=('Slider', 'Text'))
```

#### Slider implementation

The slider implementation in the core widgets now uses [nouislider](https://refreshless.com/nouislider/). This enables us to fix long-standing bugs and introduce new features, like dragging the range in a RangeSlider. ([#2712](https://github.com/jupyter-widgets/ipywidgets/pull/2712), [#630](https://github.com/jupyter-widgets/ipywidgets/issues/630), [#3216](https://github.com/jupyter-widgets/ipywidgets/pull/3216), [#2834](https://github.com/jupyter-widgets/ipywidgets/pull/2834))

#### Collaboration

By default, ipywidgets 8 enables a collaboration mode, where widget updates from one frontend are reflected back to other frontends, enabling a consistent state between multiple users and fixing synchronization between the kernel and frontend. You may want to disable these update echo messages if they are using too much bandwidth or causing slower interactivity. To disable echo update messages across ipywidgets, set the environment variable `JUPYTER_WIDGETS_ECHO` to `0`. For widget authors, to opt a specific attribute of custom widget out of echo updates (for example, if the attribute contains a lot of data that does not need to be synchronized), tag the attribute with `echo_update=False` metadata (we do this in core for the FileUpload widget's `data` attribute). ([#3195](https://github.com/jupyter-widgets/ipywidgets/pull/3195), [#3343](https://github.com/jupyter-widgets/ipywidgets/pull/3343), [#3394](https://github.com/jupyter-widgets/ipywidgets/pull/3394), [#3407](https://github.com/jupyter-widgets/ipywidgets/pull/3407))

#### CDN for html manager

We have made it easier to load widgets from content delivery networks.

- The default CDN is changed from unpkg to jsDelivr ([#3121](https://github.com/jupyter-widgets/ipywidgets/pull/3121), [#1627](https://github.com/jupyter-widgets/ipywidgets/issues/1627))
- You can use the `data-jupyter-widgets-cdn-only` attribute to load modules only from CDN ([#2792](https://github.com/jupyter-widgets/ipywidgets/pull/2792), [#2786](https://github.com/jupyter-widgets/ipywidgets/issues/2786))
- We have updated the webpack public path settings so the HTMLManager and the Jupyter Notebook extensions pull assets from wherever they are loaded, rather than only from CDN. If you author a custom widget, we highly encourage you to apply similar changes to your widget by adapting the changes at https://github.com/jupyter-widgets/widget-cookiecutter/pull/103/files. [#3464](https://github.com/jupyter-widgets/ipywidgets/pull/3464), [#3508](https://github.com/jupyter-widgets/ipywidgets/pull/3508)

#### Other changes

Here is a short list of some of the other changes in ipywidgets 8.0.

- Add a cookiecutter-based tutorial to build a custom widget ([#2919](https://github.com/jupyter-widgets/ipywidgets/pull/2919))
- Change media widgets to use memory views. ([#2723](https://github.com/jupyter-widgets/ipywidgets/pull/2723))
- Upgrade to FontAwesome 5 in html-manager ([#2713](https://github.com/jupyter-widgets/ipywidgets/pull/2713))
- Play widget now toggles between play and pause button as needed ([#2703](https://github.com/jupyter-widgets/ipywidgets/pull/2703), [#2671](https://github.com/jupyter-widgets/ipywidgets/issues/2671))
- Drop support for mapping types as selection options ([#2679](https://github.com/jupyter-widgets/ipywidgets/pull/2679), [#1958](https://github.com/jupyter-widgets/ipywidgets/issues/1958))
- Focus or blur a widget. ([#2664](https://github.com/jupyter-widgets/ipywidgets/pull/2664), [#2692](https://github.com/jupyter-widgets/ipywidgets/pull/2692), [#2691](https://github.com/jupyter-widgets/ipywidgets/pull/2691), [#2690](https://github.com/jupyter-widgets/ipywidgets/pull/2690))
- Drop notebook dependency from widgetsnbextension ([#2590](https://github.com/jupyter-widgets/ipywidgets/pull/2590))
- Cast 'value' in range sliders to a tuple ([#2441](https://github.com/jupyter-widgets/ipywidgets/pull/2441))
- Play widget: expose playing and repeat ([#2283](https://github.com/jupyter-widgets/ipywidgets/pull/2283), [#1897](https://github.com/jupyter-widgets/ipywidgets/issues/1897))
- Fix debouncing and throttling code ([#3060](https://github.com/jupyter-widgets/ipywidgets/pull/3060))
- Fix regression on spinning icons ([#2685](https://github.com/jupyter-widgets/ipywidgets/pull/2685), [#2477](https://github.com/jupyter-widgets/ipywidgets/issues/2477))
- Fix selection container default index ([#1823](https://github.com/jupyter-widgets/ipywidgets/pull/1823))
- Remove deprecated overflow properties ([#2688](https://github.com/jupyter-widgets/ipywidgets/pull/2688))
- Select: Do not force a selection if there is currently no selection and the options list changes ([#3284](https://github.com/jupyter-widgets/ipywidgets/pull/3284))
- Add support for localization to the lab extension ([#3286](https://github.com/jupyter-widgets/ipywidgets/pull/3286))
- Drop support for Python 2.7, 3.4, and 3.5 ([#2558](https://github.com/jupyter-widgets/ipywidgets/pull/2558), [#2655](https://github.com/jupyter-widgets/ipywidgets/pull/2655), [#3131](https://github.com/jupyter-widgets/ipywidgets/pull/3131), [#3120](https://github.com/jupyter-widgets/ipywidgets/pull/3120))
- Fix character escapes in combobox options ([#2972](https://github.com/jupyter-widgets/ipywidgets/pull/2972))
- Modify outputs to use a comm if IPython is not available ([#2954](https://github.com/jupyter-widgets/ipywidgets/pull/2954))
- Bugfix/parameters in the from_file method to be passed along in the media class ([#3074](https://github.com/jupyter-widgets/ipywidgets/pull/3074))
- Widgetsnbextension: throw error on failure to render ([#3280](https://github.com/jupyter-widgets/ipywidgets/pull/3280))
- Fix memory leak from Image widget not releasing object urls ([#3171](https://github.com/jupyter-widgets/ipywidgets/pull/3171), [#3170](https://github.com/jupyter-widgets/ipywidgets/pull/3170))
- ErrorWidget as fallback when widgets models or views fail - Following up ([#3304](https://github.com/jupyter-widgets/ipywidgets/pull/3304))
- Fix matplotlib plots in interact ([#3277](https://github.com/jupyter-widgets/ipywidgets/pull/3277))
- Fix selection equality checking ([#2897](https://github.com/jupyter-widgets/ipywidgets/pull/2897))
- Remove the `on_displayed` Python callback mechanism ([#2021](https://github.com/jupyter-widgets/ipywidgets/pull/2021))

### Developers

To see an overview of the changes to the core widget model specification, see [#3455](https://github.com/jupyter-widgets/ipywidgets/issues/3455).

#### Python

- `Widget.widgets` and `Widget.widget_types` are now private variables ([#3122](https://github.com/jupyter-widgets/ipywidgets/pull/3122), [#3173](https://github.com/jupyter-widgets/ipywidgets/pull/3173))
- Generate the widget data spec as JSON ([#2193](https://github.com/jupyter-widgets/ipywidgets/pull/2193))
- Use `_repr_mimebundle_` and require ipython 6.1 or later. ([#2021](https://github.com/jupyter-widgets/ipywidgets/pull/2021), [#1811](https://github.com/jupyter-widgets/ipywidgets/issues/1811))
- Hold sync during `set_state` + fix selection widgets flakiness ([#3271](https://github.com/jupyter-widgets/ipywidgets/pull/3271))
- Remove deprecated `handle_kernel` alias ([#2694](https://github.com/jupyter-widgets/ipywidgets/pull/2694))
- Removed deprecated signature of the `register` decorator ([#2695](https://github.com/jupyter-widgets/ipywidgets/pull/2695))

#### Javascript

- Fix CSS variable names to match JupyterLab names ([#2801](https://github.com/jupyter-widgets/ipywidgets/pull/2801), [#2062](https://github.com/jupyter-widgets/ipywidgets/issues/2062))
- Delete `display_model` and `display_view` ([#2752](https://github.com/jupyter-widgets/ipywidgets/pull/2752), [#2751](https://github.com/jupyter-widgets/ipywidgets/issues/2751))
- Drop underscore usage ([#2742](https://github.com/jupyter-widgets/ipywidgets/pull/2742))
- Upgrade to es2017 javascript ([#2725](https://github.com/jupyter-widgets/ipywidgets/pull/2725))
- Split base manager into separate packages ([#2710](https://github.com/jupyter-widgets/ipywidgets/pull/2710), [#2561](https://github.com/jupyter-widgets/ipywidgets/issues/2561))
- Change Phosphor to Lumino ([#2681](https://github.com/jupyter-widgets/ipywidgets/pull/2681), [#3267](https://github.com/jupyter-widgets/ipywidgets/pull/3267))
- Widgetmanagerbase: improve create_view return type ([#2662](https://github.com/jupyter-widgets/ipywidgets/pull/2662))
- Refactor the JupyterLab widget manager so it can be reused ([#2532](https://github.com/jupyter-widgets/ipywidgets/pull/2532))
- Make more of lab manager dependencies optional ([#2528](https://github.com/jupyter-widgets/ipywidgets/pull/2528))
- Remove class `jupyter-widgets` from `jp-outputarea-output` node ([#2500](https://github.com/jupyter-widgets/ipywidgets/pull/2500))
- Rename `pWidget` to `luminoWidget` and deprecate `pWidget` ([#3118](https://github.com/jupyter-widgets/ipywidgets/pull/3118), [#3141](https://github.com/jupyter-widgets/ipywidgets/pull/3141), [#3358](https://github.com/jupyter-widgets/ipywidgets/pull/3358),)
- Add `layout`, `style`, and `shown` events ([#3300](https://github.com/jupyter-widgets/ipywidgets/pull/3300))
- Implement `jupyter.widget.control` comm channel ([#3313](https://github.com/jupyter-widgets/ipywidgets/pull/3313))
- Update to TypeScript 4.3 ([#3162](https://github.com/jupyter-widgets/ipywidgets/pull/3162))
- Add event listener for resize events ([#3124](https://github.com/jupyter-widgets/ipywidgets/pull/3124))
- Remove `process.cwd` polyfill ([#3315](https://github.com/jupyter-widgets/ipywidgets/pull/3315))
- Make sure buffer is a DataView ([#3127](https://github.com/jupyter-widgets/ipywidgets/pull/3127))
- Deprecate the overly broad CSS class `widget` and introduce a similar `jupyter-widget` CSS class ([#3146](https://github.com/jupyter-widgets/ipywidgets/pull/3146))
- Fetch the full widget state via a control Comm ([#3021](https://github.com/jupyter-widgets/ipywidgets/pull/3021))
- Export LabWidgetManager and KernelWidgetManager ([#3166](https://github.com/jupyter-widgets/ipywidgets/pull/3166))
- More helpful semver range message ([#3185](https://github.com/jupyter-widgets/ipywidgets/pull/3185))
- Make the base widget manager `.get_model()` method always return a Promise, which is rejected if the requested model is not registered. To test if a model is registered, use the new `.has_model()` method ([#3389](https://github.com/jupyter-widgets/ipywidgets/pull/3389))

### Documentation improvements

- Documentation overhaul ([#3104](https://github.com/jupyter-widgets/ipywidgets/pull/3104),
  [#3096](https://github.com/jupyter-widgets/ipywidgets/issues/3096), [#3099](https://github.com/jupyter-widgets/ipywidgets/pull/3099),
  [#3076](https://github.com/jupyter-widgets/ipywidgets/issues/3076), [#2824](https://github.com/jupyter-widgets/ipywidgets/pull/2824),
  [#3246](https://github.com/jupyter-widgets/ipywidgets/pull/3246), [#3243](https://github.com/jupyter-widgets/ipywidgets/pull/3243),
  [#3103](https://github.com/jupyter-widgets/ipywidgets/pull/3103), [#3165](https://github.com/jupyter-widgets/ipywidgets/pull/3165),
  [#3283](https://github.com/jupyter-widgets/ipywidgets/pull/3283), [#2927](https://github.com/jupyter-widgets/ipywidgets/pull/2927),
  [#3062](https://github.com/jupyter-widgets/ipywidgets/pull/3062), [#3129](https://github.com/jupyter-widgets/ipywidgets/pull/3129),
  [#3130](https://github.com/jupyter-widgets/ipywidgets/pull/3130), [#3155](https://github.com/jupyter-widgets/ipywidgets/pull/3155),
  )
- Remove step parameter from widget list notebook ([#3106](https://github.com/jupyter-widgets/ipywidgets/pull/3106))
- Remove extra requirements from doc to fix RTD build ([#3098](https://github.com/jupyter-widgets/ipywidgets/pull/3098))
- Align doc requirements for 7.x branch with master ([#3094](https://github.com/jupyter-widgets/ipywidgets/pull/3094))
- Remove defunct deep-links from install in README ([#3225](https://github.com/jupyter-widgets/ipywidgets/pull/3225))
- Fix documentation about embedding widget in HTML ([#3224](https://github.com/jupyter-widgets/ipywidgets/pull/3224))
- Fix example web3 missing process during runtime ([#3223](https://github.com/jupyter-widgets/ipywidgets/pull/3223))
- Complete docstring for `interactive`. ([#3169](https://github.com/jupyter-widgets/ipywidgets/pull/3169))
- Unpin ipykernel<6 for the docs ([#3168](https://github.com/jupyter-widgets/ipywidgets/pull/3168))
- Checking milestone and generating changelog ([#3125](https://github.com/jupyter-widgets/ipywidgets/pull/3125))
- Change graph example to receive a tuple instead of a dict ([#3117](https://github.com/jupyter-widgets/ipywidgets/pull/3117))
- Fix debouncing and throttling code ([#3060](https://github.com/jupyter-widgets/ipywidgets/pull/3060))
- Variable Inspector example used a wrong callback argument signature ([#3302](https://github.com/jupyter-widgets/ipywidgets/pull/3302))

### Repo maintenance

- Visual regression testing using Galata ([#3172](https://github.com/jupyter-widgets/ipywidgets/pull/3172), [#3279](https://github.com/jupyter-widgets/ipywidgets/pull/3279))
- Reorganize packages in the monorepo, moving the python packages to the `python` folder ([#3301](https://github.com/jupyter-widgets/ipywidgets/pull/3301), [#3316](https://github.com/jupyter-widgets/ipywidgets/pull/3316))
- Use new custom widget label on issue template ([#3176](https://github.com/jupyter-widgets/ipywidgets/pull/3176))
- Create and upload reference screenshots on CI failure ([#3227](https://github.com/jupyter-widgets/ipywidgets/pull/3227))
- Allow generate-spec to take optional output file ([#3174](https://github.com/jupyter-widgets/ipywidgets/pull/3174))
- Update to Jupyter Packaging 0.10 ([#3194](https://github.com/jupyter-widgets/ipywidgets/pull/3194))
- Update bug report test environment ([#3156](https://github.com/jupyter-widgets/ipywidgets/pull/3156))
- Create links out to gitter and discourse from the new issue options ([#3153](https://github.com/jupyter-widgets/ipywidgets/pull/3153))
- Adapt the milestone_check script from JupyterLab for ipywidgets. ([#3091](https://github.com/jupyter-widgets/ipywidgets/pull/3091))
- Fix spec generation for traitlets 5 ([#3234](https://github.com/jupyter-widgets/ipywidgets/pull/3234))
- Add documentation issue template ([#3095](https://github.com/jupyter-widgets/ipywidgets/pull/3095))
- Add Binder links and badges ([#3164](https://github.com/jupyter-widgets/ipywidgets/pull/3164), [#3212](https://github.com/jupyter-widgets/ipywidgets/pull/3212), [#3151](https://github.com/jupyter-widgets/ipywidgets/pull/3151), [#3148](https://github.com/jupyter-widgets/ipywidgets/pull/3148), [#2701](https://github.com/jupyter-widgets/ipywidgets/pull/2701))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyter-widgets/ipywidgets/graphs/contributors?from=2019-06-11&to=2022-08-05&type=c))

[@afonit](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aafonit+updated%3A2019-06-11..2022-08-05&type=Issues) | [@alex-rind](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aalex-rind+updated%3A2019-06-11..2022-08-05&type=Issues) | [@Alexboiboi](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3AAlexboiboi+updated%3A2019-06-11..2022-08-05&type=Issues) | [@azjps](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aazjps+updated%3A2019-06-11..2022-08-05&type=Issues) | [@blois](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ablois+updated%3A2019-06-11..2022-08-05&type=Issues) | [@bollwyvl](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Abollwyvl+updated%3A2019-06-11..2022-08-05&type=Issues) | [@bsyouness](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Absyouness+updated%3A2019-06-11..2022-08-05&type=Issues) | [@casperdcl](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Acasperdcl+updated%3A2019-06-11..2022-08-05&type=Issues) | [@crahan](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Acrahan+updated%3A2019-06-11..2022-08-05&type=Issues) | [@davidbrochart](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Adavidbrochart+updated%3A2019-06-11..2022-08-05&type=Issues) | [@deisi](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Adeisi+updated%3A2019-06-11..2022-08-05&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Adependabot+updated%3A2019-06-11..2022-08-05&type=Issues) | [@elliothershberg](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aelliothershberg+updated%3A2019-06-11..2022-08-05&type=Issues) | [@fperez](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Afperez+updated%3A2019-06-11..2022-08-05&type=Issues) | [@giswqs](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Agiswqs+updated%3A2019-06-11..2022-08-05&type=Issues) | [@github-actions](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Agithub-actions+updated%3A2019-06-11..2022-08-05&type=Issues) | [@hai-schrodinger](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ahai-schrodinger+updated%3A2019-06-11..2022-08-05&type=Issues) | [@ianhi](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aianhi+updated%3A2019-06-11..2022-08-05&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aibdafna+updated%3A2019-06-11..2022-08-05&type=Issues) | [@jasongrout](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ajasongrout+updated%3A2019-06-11..2022-08-05&type=Issues) | [@jbpauly](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ajbpauly+updated%3A2019-06-11..2022-08-05&type=Issues) | [@joequant](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ajoequant+updated%3A2019-06-11..2022-08-05&type=Issues) | [@joseph2rs](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ajoseph2rs+updated%3A2019-06-11..2022-08-05&type=Issues) | [@jpn--](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ajpn--+updated%3A2019-06-11..2022-08-05&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ajtpio+updated%3A2019-06-11..2022-08-05&type=Issues) | [@keatonb](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Akeatonb+updated%3A2019-06-11..2022-08-05&type=Issues) | [@kedarisetti](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Akedarisetti+updated%3A2019-06-11..2022-08-05&type=Issues) | [@kefirbandi](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Akefirbandi+updated%3A2019-06-11..2022-08-05&type=Issues) | [@maartenbreddels](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Amaartenbreddels+updated%3A2019-06-11..2022-08-05&type=Issues) | [@manuvazquez](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Amanuvazquez+updated%3A2019-06-11..2022-08-05&type=Issues) | [@marimeireles](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Amarimeireles+updated%3A2019-06-11..2022-08-05&type=Issues) | [@MartinKolarik](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3AMartinKolarik+updated%3A2019-06-11..2022-08-05&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3AmartinRenou+updated%3A2019-06-11..2022-08-05&type=Issues) | [@mbektas](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ambektas+updated%3A2019-06-11..2022-08-05&type=Issues) | [@meeseeksdev](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ameeseeksdev+updated%3A2019-06-11..2022-08-05&type=Issues) | [@meeseeksmachine](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ameeseeksmachine+updated%3A2019-06-11..2022-08-05&type=Issues) | [@mgeier](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Amgeier+updated%3A2019-06-11..2022-08-05&type=Issues) | [@MicaelJarniac](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3AMicaelJarniac+updated%3A2019-06-11..2022-08-05&type=Issues) | [@minrk](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Aminrk+updated%3A2019-06-11..2022-08-05&type=Issues) | [@MSeal](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3AMSeal+updated%3A2019-06-11..2022-08-05&type=Issues) | [@mwcraig](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Amwcraig+updated%3A2019-06-11..2022-08-05&type=Issues) | [@NichtJens](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3ANichtJens+updated%3A2019-06-11..2022-08-05&type=Issues) | [@nmstoker](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Anmstoker+updated%3A2019-06-11..2022-08-05&type=Issues) | [@partev](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Apartev+updated%3A2019-06-11..2022-08-05&type=Issues) | [@pbugnion](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Apbugnion+updated%3A2019-06-11..2022-08-05&type=Issues) | [@raziqraif](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Araziqraif+updated%3A2019-06-11..2022-08-05&type=Issues) | [@rsheftel](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Arsheftel+updated%3A2019-06-11..2022-08-05&type=Issues) | [@shaperilio](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Ashaperilio+updated%3A2019-06-11..2022-08-05&type=Issues) | [@smeng9](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Asmeng9+updated%3A2019-06-11..2022-08-05&type=Issues) | [@snickell](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Asnickell+updated%3A2019-06-11..2022-08-05&type=Issues) | [@StefanBrand](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3AStefanBrand+updated%3A2019-06-11..2022-08-05&type=Issues) | [@stonebig](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Astonebig+updated%3A2019-06-11..2022-08-05&type=Issues) | [@SylvainCorlay](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3ASylvainCorlay+updated%3A2019-06-11..2022-08-05&type=Issues) | [@thomasaarholt](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Athomasaarholt+updated%3A2019-06-11..2022-08-05&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Atrungleduc+updated%3A2019-06-11..2022-08-05&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Avidartf+updated%3A2019-06-11..2022-08-05&type=Issues) | [@willingc](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Awillingc+updated%3A2019-06-11..2022-08-05&type=Issues) | [@zerline](https://github.com/search?q=repo%3Ajupyter-widgets%2Fipywidgets+involves%3Azerline+updated%3A2019-06-11..2022-08-05&type=Issues)

## 7.7.1

To see the full list of pull requests, see the [7.7.1 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/36?closed=1) on GitHub.

Highlights include:

- Fix broken link icon for FontAwesome 4 and 5 [#3495](https://github.com/jupyter-widgets/ipywidgets/pull/3495)
- Fix message throttling bug [#3494](https://github.com/jupyter-widgets/ipywidgets/pull/3494)
- Fix state message parsing to be more permissive [#3486](https://github.com/jupyter-widgets/ipywidgets/pull/3486)
- Fix tests on Python 3.11 [#3480](https://github.com/jupyter-widgets/ipywidgets/pull/3480)
- Add better front-page docs [#3496](https://github.com/jupyter-widgets/ipywidgets/pull/3496)

  7.7

---

To see the full list of pull requests and issues, see the [7.7 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/35?closed=1) on GitHub.

Highlights include:

- Fix installation on Python 3.10. [#3368](https://github.com/jupyter-widgets/ipywidgets/pull/3368)
- Throw an error if we cannot render a widget, enabling the rendering system to fall back to rendering a different data type if available. [#3290](https://github.com/jupyter-widgets/ipywidgets/pull/3290)
- Create a new widget control comm channel, enabling more efficient fetching of kernel widget state. [#3201](https://github.com/jupyter-widgets/ipywidgets/pull/3021)
- Refactor logic for fetching kernel widget state to the manager base class. This logic first tries to use the new widget control comm channel, falling back to the existing method of requesting each widget's state individually. [#3337](https://github.com/jupyter-widgets/ipywidgets/pull/3337)
- Enable HTMLManager output widgets to render state updates. [#3372](https://github.com/jupyter-widgets/ipywidgets/pull/3372)
- Do not reset JupyterLab CSS variables if they are already defined. [#3344](https://github.com/jupyter-widgets/ipywidgets/pull/3344)
- Fix variable inspector example. [#3302](https://github.com/jupyter-widgets/ipywidgets/pull/3302)
- Introduce new widget manager `has_model` method for synchronously checking if a widget model is registered. [#3377](https://github.com/jupyter-widgets/ipywidgets/pull/3377)
- Work around bug in Chrome rendering Combobox arrows. [#3375](https://github.com/jupyter-widgets/ipywidgets/pull/3375)
- Optionally echo update messages from frontends to other frontends. This enables widget views in different frontends to maintain consistent state simultaneously, and also makes sure that simultaneous updates from the kernel and frontend resolve to a consistent state. This is off by default in ipywidgets 7.7, and it is anticipated this will be on by default in ipywidgets 8.0. To enable echo update messages across ipywidgets, set the environment variable `JUPYTER_WIDGETS_ECHO` to 1. To opt a specific attribute out of echo updates, tag the attribute with `echo_update=False` metadata (we do this in core for the FileUpload widget's `data` attribute). [#3400](https://github.com/jupyter-widgets/ipywidgets/pull/3400), [#3394](https://github.com/jupyter-widgets/ipywidgets/pull/3394)

## 7.6

To see the full list of pull requests and issues, see the [7.6.0 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/31?closed=1) on GitHub.

The main change in this release is that installing `ipywidgets` 7.6.0 will now automatically enable ipywidgets support in JupyterLab 3.0—a user has no extra JupyterLab installation step and no rebuild of JupyterLab, nor do they need Node.js installed. Simply install the python ipywidgets package with pip (`pip install ipywidgets==7.6.0`) or conda/mamba (`conda install -c conda-forge ipywidgets=7.6.0`) and ipywidgets will automatically work in classic Jupyter Notebook and in JupyterLab 3.0.

This is accomplished with the new python package `jupyterlab_widgets` version 1.0, on which `ipywidgets` 7.6.0 now depends (similar to how `ipywidgets` already depends on the `widgetsnbextension` package to configure ipywidgets for the classic Jupyter Notebook). The `jupyterlab_widgets` Python package is a JupyterLab 3.0 prebuilt extension, meaning that it can be installed into JupyterLab 3.0 without rebuilding JupyterLab and without needing Node.js installed.

### Updates for Widget Maintainers

Custom widget maintainers will need to make two changes to update for JupyterLab 3:

1. Update the `@jupyter-widgets/base` dependency version to include `^4` to work in JupyterLab 3.0. For example, if you had a dependency on `@jupyter-widgets/base` version `^2 || ^3`, update to `^2 || ^3 || ^4` for your widget to work in classic Jupyter Notebook, JupyterLab 1, JupyterLab 2, and JupyterLab 3. See [#2472](https://github.com/jupyter-widgets/ipywidgets/pull/2472) for background.
2. In the `package.json`, add the following `sharedPackages` configuration inside the `jupyterlab` key. See the [JupyterLab extension documentation](https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html#requiring-a-service) for more information.

   ```json
     "jupyterlab": {
       "sharedPackages": {
         "@jupyter-widgets/base": {
           "bundled": false,
           "singleton": true
         }
       }
     }
   ```

Separate from these two steps to update for JupyterLab 3, we also recommend that you make your widget's JupyterLab extension a prebuilt extension for JupyterLab 3.0. Users will be able to install your JupyterLab 3.0 prebuilt extension without rebuilding JupyterLab or needing Node.js. See the [JupyterLab 3 extension developer documentation](https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html) or the new [widget extension cookiecutter](https://github.com/jupyter-widgets/widget-ts-cookiecutter/tree/jlab3) for more details.

## 7.5

To see the full list of pull requests and issues, see the [7.5 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/268?closed=1) on GitHub.

Changes include:

- New `AppLayout` and `GridLayout` templates for positioning interactive widgets. [#2333](https://github.com/jupyter-widgets/ipywidgets/pull/2333)
- New `FileUpload` widget allowing users to upload files from the browser. [#2258](https://github.com/jupyter-widgets/ipywidgets/pull/2258)
- New `ComboBox` widget. [#2390](https://github.com/jupyter-widgets/ipywidgets/pull/2390)
- JupyterLab CSS variables are now exposed by default even in the case of the classic notebook. [#2418](https://github.com/jupyter-widgets/ipywidgets/pull/2418)

### Updates for Widget Maintainers

Custom widget maintainers will need to update their `@jupyter-widgets/base` dependency version to work in JupyterLab 1.0. For example, if you had a dependency on `@jupyter-widgets/base` version `^1.1`, update to `^1.1 || ^2` for your widget to work in classic notebook, JupyterLab 0.35, and JupyterLab 1.0. See [#2472](https://github.com/jupyter-widgets/ipywidgets/pull/2472) for background.

## 7.4

To see the full list of pull requests and issues, see the [7.4 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/26?closed=1) on GitHub.

Changes include:

- New `Video` and `Audio` widgets have been introduced. [#2162](https://github.com/jupyter-widgets/ipywidgets/pull/2162)
  We updated the `@jupyter-widgets/controls` widget specification version to `1.4.0`, leading to the version bump to 7.4.
- The use of mappings for the `options` attribute of selection widgets is deprecated. [#2130](https://github.com/jupyter-widgets/ipywidgets/pull/2130)

## 7.3

To see the full list of pull requests and issues, see the [7.3 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/26?closed=1) on GitHub.

Changes include:

- A new `GridBox` widget is introduced and associated CSS grid properties are added to the layout. This enables using the CSS Grid spec for laying out widgets. See the [Widget Styling](http://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Styling.html) documentation for some examples. Because of this and other model specification changes, the view and module versions of widgets was incremented in both the base and controls packages. ([#2107](https://github.com/jupyter-widgets/ipywidgets/pull/2107), [#2064](https://github.com/jupyter-widgets/ipywidgets/pull/2064), [#1942](https://github.com/jupyter-widgets/ipywidgets/issues/1942))

- Widgets with a `description` attribute now also have a `description_tooltip` attribute to set a tooltip on the description. The tooltip defaults to the description text. Setting `description_tooltip` to `''` removes it, and setting it to `None` makes the tooltip default to the description text. ([#2070](https://github.com/jupyter-widgets/ipywidgets/pull/2070))

- `'transparent'` is now a valid color for color attributes. ([#2128](https://github.com/jupyter-widgets/ipywidgets/pull/2128))

- Dropdowns now have extra padding to make room for the dropdown arrow. ([#2052](https://github.com/jupyter-widgets/ipywidgets/issues/2052), [#2101](https://github.com/jupyter-widgets/ipywidgets/pull/2101))

- Image widget `repr` now truncates the image value to prevent huge amounts of output in notebooks. ([#2111](https://github.com/jupyter-widgets/ipywidgets/pull/2111))

- Python 3.3 support is dropped. Python 3.3 support was dropped in the Python community in [September 2017](https://www.python.org/dev/peps/pep-0398/#x-end-of-life). ([#2129](https://github.com/jupyter-widgets/ipywidgets/pull/2129))

- The license information has been consolidated into the LICENSE file, and the COPYING.md file is removed. If you are repackaging ipywidgets or widgetsnbextension, please make sure to include LICENSE instead of COPYING.md. ([#2133](https://github.com/jupyter-widgets/ipywidgets/pull/2133), [#2048](https://github.com/jupyter-widgets/ipywidgets/pull/2048), [#1701](https://github.com/jupyter-widgets/ipywidgets/issues/1701), [#1706](https://github.com/jupyter-widgets/ipywidgets/pull/1706))

## 7.2

To see the full list of pull requests and issues, see the [7.2 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/25?closed=1) on GitHub.

User-visible changes include:

- A new `FloatLogSlider` widget is a slider with a log scale, suitable for exploring a wide range of magnitudes. ([#1928](https://github.com/jupyter-widgets/ipywidgets/pull/1928), [#2014](https://github.com/jupyter-widgets/ipywidgets/pull/2014))
  ```python
  from ipywidgets import FloatLogSlider
  FloatLogSlider()
  ```
- `link` and `dlink` are now exported from ipywidgets for convenience, so that you can import them directly from ipywidgets instead of needing to import them from traitlets. ([#1923](https://github.com/jupyter-widgets/ipywidgets/pull/1923))
- A new option `manual_name` has been added to `interact_manual()` to change the name of the update button, for example `interact_manual(manual_name='Update')`. ([#1924](https://github.com/jupyter-widgets/ipywidgets/pull/1923))
- The Output widget now has a `.capture()` method, which returns a decorator to capture the output of a function.

  ```python
  from ipywidgets import Output
  out = Output()

  @out.capture()
  def f():
    print('This output is captured')
  ```

  The `.capture()` method has a `clear_output` boolean argument to automatically clear the output every time the function is run, as well as a `wait` argument corresponding to the `clear_output` wait argument. ([#1934](https://github.com/jupyter-widgets/ipywidgets/pull/1934))

- The Output widget has much more comprehensive documentation in its own section. ([#2020](https://github.com/jupyter-widgets/ipywidgets/pull/2020))
- Installing `widgetsnbextension` now automatically enables the nbextension in Jupyter Notebook 5.3 or later. ([#1911](https://github.com/jupyter-widgets/ipywidgets/pull/1911))
- The default rendering of a widget if widgets are not installed is now a short description of the widget in text instead of a much longer HTML message. ([#2007](https://github.com/jupyter-widgets/ipywidgets/pull/2007))

Changes for developers include:

- The JavaScript base widget manager class now has a `resolveUrl` method to resolve a URL relative to the current notebook location. ([#1993](https://github.com/jupyter-widgets/ipywidgets/pull/1993))
- The html manager now exposes a way to specify which JavaScript file is fetched for a package and the loader used to fetch the library. ([#1995](https://github.com/jupyter-widgets/ipywidgets/pull/1995), [#1998](https://github.com/jupyter-widgets/ipywidgets/pull/1998))
- The `@jupyter-widgets/controls` widget specification version was bumped to `1.2.0`. Changes include the FloatLogSlider widget and more specific documentation about array element types. ([#2017](https://github.com/jupyter-widgets/ipywidgets/pull/2017))

## 7.1

To see the full list of pull requests and issues, see the [7.1 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/23?closed=1) on GitHub.

We updated the `@jupyter-widgets/controls` widget specification version to `1.1.0`, leading to the version bump to 7.1. The new widget model specification now includes new `description_width` and `font_weight` attributes for the `ToggleButtonsStyle` widget. There are also other bugfixes in this release.

## 7.0.x patch releases

See the GitHub milestones for the [7.0.1](https://github.com/jupyter-widgets/ipywidgets/milestone/16?closed=1), [7.0.2](https://github.com/jupyter-widgets/ipywidgets/milestone/17?closed=1), [7.0.3](https://github.com/jupyter-widgets/ipywidgets/milestone/18?closed=1), [7.0.4](https://github.com/jupyter-widgets/ipywidgets/milestone/20?closed=1), and [7.0.5](https://github.com/jupyter-widgets/ipywidgets/milestone/21?closed=1) releases for bugfixes in these releases.

## 7.0

To see the full list of pull requests and issues, see the [7.0 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/12?closed=1) on GitHub.

Major user-visible changes in ipywidgets 7.0 include:

- Widgets are now displayed in the output area in the classic notebook and are treated as any other output. This allows the widgets to work more naturally with other cell output. To delete a widget, clear the output from the cell. Output from functions triggered by a widget view is appended to the output area that contains the widget view. This means that printed text will be appended to the output, and calling `clear_output()` will delete the entire output, including the widget view. ([#1274](https://github.com/jupyter-widgets/ipywidgets/pull/1274), [#1353](https://github.com/jupyter-widgets/ipywidgets/pull/1353))
- Removed the version validation check since it was causing too many false warnings about the widget javascript not being installed or the wrong version number. It is now up to the user to ensure that the ipywidgets and widgetsnbextension packages are compatible. ([#1219](https://github.com/jupyter-widgets/ipywidgets/pull/1219))
- The documentation theme is changed to the new standard Jupyter theme. ([#1363](https://github.com/jupyter-widgets/ipywidgets/pull/1363))
- The `layout` and `style` traits can be set with a dictionary for convenience, which will automatically converted to a Layout or Style object, like `IntSlider(layout={'width': '100%'}, style={'handle_color': 'lightgreen'})`. ([#1253](https://github.com/jupyter-widgets/ipywidgets/pull/1253))
- The Select widget now is a listbox instead of a dropdown, reverting back to the pre-6.0 behavior. ([#1238](https://github.com/jupyter-widgets/ipywidgets/pull/1238))
- The Select and SelectMultiple widgets now have a `rows` attribute for the number of rows to display, consistent with the Textarea widget. The `layout.height` attribute overrides this to control the height of the widget. ([#1250](https://github.com/jupyter-widgets/ipywidgets/pull/1250))
- Selection widgets (`Select`, `Dropdown`, `ToggleButtons`, etc.) have new `.value`, `.label`, and `.index` traits to make it easier to access or change the selected option. ([#1262](https://github.com/jupyter-widgets/ipywidgets/pull/1262), [#1513](https://github.com/jupyter-widgets/ipywidgets/pull/1513))
- Selection container widgets (`Accordion`, `Tabs`) can have their `.selected_index` set to `None` to deselect all items. ([#1495](https://github.com/jupyter-widgets/ipywidgets/pull/1495))
- The `Play` widget range is now inclusive (max value is max, instead of max-1), to be consistent with Sliders
- The `Play` widget now has an optional repeat toggle button (visible by default). ([#1190](https://github.com/jupyter-widgets/ipywidgets/pull/1190))
- A refactoring of the text, slider, slider range, and progress widgets in resulted in the progress widgets losing their `step` attribute (which was previously ignored), and a number of these widgets changing their `_model_name` and/or `_view_name` attributes ([#1290](https://github.com/jupyter-widgets/ipywidgets/pull/1290))
- The `Checkbox` description is now on the right of the checkbox and is clickable. The `Checkbox` widget has a new `indent` attribute (defaults to `True`) to line up nicely with controls that have descriptions. To make the checkbox align to the left, set `indent` to `False`. ([#1346](https://github.com/jupyter-widgets/ipywidgets/pull/1346))
- A new Password widget, which behaves exactly like the Text widget, but hides the typed text: `Password()`. ([#1310](https://github.com/jupyter-widgets/ipywidgets/pull/1310))
- A new SelectionRangeSlider widget for selecting ranges from ordered lists of objects. For example, this enables having a slider to select a date range. ([#1356](https://github.com/jupyter-widgets/ipywidgets/pull/1356))
- The `Label` widget now has no width restriction. ([#1269](https://github.com/jupyter-widgets/ipywidgets/pull/1269))
- The description width is now configurable with the `.style.description_width` attribute ([#1376](https://github.com/jupyter-widgets/ipywidgets/pull/1376))
- ToggleButtons have a new `.style.button_width` attribute to set the CSS width of the buttons. Set this to `'initial'` to have buttons that individually size to the content width. ([#1257](https://github.com/jupyter-widgets/ipywidgets/pull/1257))
- The `readout_format` attribute of number sliders now validates its argument. ([#1550](https://github.com/jupyter-widgets/ipywidgets/pull/1550))
- The `IntRangeSlider` widget now has a `.readout_format` trait to control the formatting of the readout. ([#1446](https://github.com/jupyter-widgets/ipywidgets/pull/1446))
- The `Text`, `Textarea`, `IntText`, `BoundedIntText`, `FloatText`, and `BoundedFloatText` widgets all gained a `continuous_update` attribute (defaults to `True` for `Text` and `TextArea`, and `False` for the others). ([#1545](https://github.com/jupyter-widgets/ipywidgets/pull/1545))
- The `IntText`, `BoundedIntText`, `FloatText`, and `BoundedFloatText` widgets are now rendered as HTML number inputs, and have a `step` attribute that controls the resolution. ([#1545](https://github.com/jupyter-widgets/ipywidgets/pull/1545))
- The `Text.on_submit` callback is deprecated; instead, set `continuous_update` to `False` and observe the `value` attribute: `mywidget.observe(callback, 'value')`. The `Textarea.scroll_to_bottom` method was removed. ([#1545](https://github.com/jupyter-widgets/ipywidgets/pull/1545))
- The `msg_throttle` attribute on widgets is now gone, and the code has a hardcoded message throttle equivalent to `msg_throttle=1`. ([#1557](https://github.com/jupyter-widgets/ipywidgets/pull/1557))
- Using function annotations to specify interact controls for a function is now deprecated and will be removed in a future version of ipywidgets. ([#1292](https://github.com/jupyter-widgets/ipywidgets/pull/1292))
- There are now two simple ways to embed widgets in an HTML page: with a simple script tag that does not use require.js and does not support anything but the basic widgets, and a require module that does support custom widgets. See the migration guide for more details. ([#1615](https://github.com/jupyter-widgets/ipywidgets/pull/1615), [#1629](https://github.com/jupyter-widgets/ipywidgets/pull/1629), [#1630](https://github.com/jupyter-widgets/ipywidgets/pull/1630))

If you are developing a custom widget or widget manager, here are some major changes that may affect you. The [migration guide](./migration_guides.md) also walks through how to upgrade a custom widget.

- On the Python/kernel side:
  - The Python `@register` decorator for widget classes no longer takes a string argument, but registers a widget class using the `_model_*` and `_view_*` traits in the class. Using the decorator as `@register('name')` is deprecated and should be changed to just `@register`. [#1228](https://github.com/jupyter-widgets/ipywidgets/pull/1228), [#1276](https://github.com/jupyter-widgets/ipywidgets/pull/1276)
  - Widgets will now need correct `_model_module` and `_view_module` Unicode traits defined.
  - Selection widgets now sync the index of the selected item, rather than the label. ([#1262](https://github.com/jupyter-widgets/ipywidgets/pull/1262))
  - The Python `ipywidget.domwidget.LabeledWidget` is now `ipywidget.widget_description.DescriptionWidget`, and there is a new `ipywidget.widget_description.DescriptionStyle` that lets the user set the CSS width of the description.
  - Custom serializers can now return a structure that contains binary objects (`memoryview`, `bytearray`, or Python 3 `bytes` object). In this case, the sync message will be a binary message, which is much more efficient for binary data than base64-encoding. The Image widget now uses this binary synchronization. ([#1194](https://github.com/jupyter-widgets/ipywidgets/pull/1194), [#1595](https://github.com/jupyter-widgets/ipywidgets/pull/1595), [#1643](https://github.com/jupyter-widgets/ipywidgets/pull/1643))
- On the Javascript side:
  - The `jupyter-js-widgets` Javascript package has been split into `@jupyter-widgets/base` package (containing base widget classes, the DOM widget, and the associated layout and style classes), and the `@jupyter-widgets/controls` package (containing the rest of the Jupyter widgets controls). Authors of custom widgets will need to update to depend on `@jupyter-widgets/base` instead of `jupyter-js-widgets` (if you use a class from the controls package, you will also need to depend on `@jupyter-widgets/controls`). See the [cookie cutter](https://github.com/jupyter-widgets/widget-cookiecutter) to generate a simple example custom widget using the new packages.
  - Custom serializers in Javascript are now synchronous, and should return a snapshot of the widget state. The default serializer makes a copy of JSONable objects. ([#1270](https://github.com/jupyter-widgets/ipywidgets/pull/1270))
  - Custom serializers can now return a structure that contains binary objects (`ArrayBuffer`, `DataView`, or a typed array such as `Int8Array`, `Float64Array`, etc.). In this case, the sync message will be a binary message, which is much more efficient for binary data than base64-encoding. The Image widget now uses this binary synchronization. ([#1194](https://github.com/jupyter-widgets/ipywidgets/pull/1194), [#1643](https://github.com/jupyter-widgets/ipywidgets/pull/1643))
  - A custom serializer is given the widget instance as its second argument, and a custom deserializer is given the widget manager as its second argument.
  - The Javascript model `.id` attribute has been renamed to `.model_id` to avoid conflicting with the Backbone `.id` attribute. ([#1410](https://github.com/jupyter-widgets/ipywidgets/pull/1410))
- Regarding widget managers and the syncing message protocol:
  - The widget protocol was significantly overhauled. The new widget messaging protocol (version 2) is specified in the [version 2 protocol documentation](https://github.com/jupyter-widgets/ipywidgets/blob/main/jupyter-widgets-schema/messages.md).
  - Widgets are now displayed with a `display_data` message instead of with a custom comm message. See the [ipywidgets](https://github.com/jupyter-widgets/ipywidgets/blob/20cd0f050090b1b19bb9657b8c3fa42ae384cfca/ipywidgets/widgets/widget.py#L656) implementation for an example. ([#1274](https://github.com/jupyter-widgets/ipywidgets/pull/1274))
  - Custom widget managers are now responsible completely for loading widget model and view classes. Widget managers should provide an output model and view class appropriate for their environment so that the `Output` widget works. ([#1313](https://github.com/jupyter-widgets/ipywidgets/pull/1313))
  - The widget manager `clear_state` method no longer has a `commlessOnly` argument. All models in the widget manager will be closed and cleared when `clear_state` is called. ([#1354](https://github.com/jupyter-widgets/ipywidgets/pull/1354))

## 6.0

Major user-visible changes in ipywidgets 6.0 include:

- Rendering of Jupyter interactive widgets in various web contexts

  sphinx documentation: http://ipywidgets.readthedocs.io/en/latest/examples/Widget%20List.html
  nbviewer: http://nbviewer.jupyter.org/github/jupyter-widgets/ipywidgets/blob/main/docs/source/examples/Widget%20List.ipynb
  Static web pages: http://jupyter.org/widgets

- Addition of a DatePicker widget in the core widget collection.

- Changes to the automatic control generation syntax in @interact, inspired by the Sage interact syntax.

- Removal of APIs which had been deprecated in 5.0, including top-level styling in attributes of DOMWidgets and some corner cases in the behavior of `@interact`.

- A new API for custom styling of widgets is provided, through a top-level `style` attribute. For example, the color of a slider handler can be set by `slider.style.handle_color`.

- Removal of the Proxy and PlaceProxy widgets.

- Removal of the deprecated `FlexBox` widget. Use the `Box`, `HBox`, or `VBox` widgets instead. Various flex properties can be set using the `layout` attribute.

- Removal of the deprecated `Latex` widget. Use the new `HTMLMath` widget with Latex math inside `$` or `$$` delimiters instead.

- Removal of the deprecated layout properties on a widget such as `.width`, `.height`, etc. Use the `layout` attribute with a `Layout` widget to manage various layout properties instead.

- The `Label` widget now has styling to make it consistent with labels on various widgets. To have freeform text with mathematics, use the new `HTMLMath` widget.

- Removal of the `button_style` attribute of the Dropdown widget

- Addition of an OutputWidget for capturing output and rich display objects. @interact has changed to use an OutputWidget for function output instead of overwriting the output area of a cell.

- The jupyter-js-widgets Javascript implementation now relies on the PhosphorJS framework for the management of rich layout and a better integration of JupyterLab.

- Numerous bug fixes.

_Note for custom widget authors:_

ipywidgets 6.0 breaks backward compatibility with respect to the handling of default values of the JavaScript side. Now, the default values for core widget models are specified with a `default()` method returning a dictionary instead of a `default` dictionary attribute. If you want your library to be backwards compatible with ipywidgets 5.x, you could use [\_.result](http://underscorejs.org/#result) like this:

```javascript
...
defaults: function() {
        return _.extend(_.result(this, 'widgets.DOMWidgetModel.prototype.defaults'), {
          ....
        })
},
...
```

This should not have an impact when using your custom widgets in the classic notebook, but will be really important when deploying your interactive widgets in web contexts.

## 5.x

## 4.1.x

### 4.1.1

### 4.1.0

## 4.0.x

### 4.0.3

Bump version with miscellaneous bug fixes.

### 4.0.2

Add README.rst documentation.

### 4.0.1

Remove ipynb checkpoints.

### 4.0.0

First release of **ipywidgets** as a standalone package.
