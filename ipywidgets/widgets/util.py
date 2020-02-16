from html.parser import HTMLParser

ALLOWED_TAGS = ['a', 'abbr', 'b', 'blockquote', 'code', 'em', 'i', 'img', 'li', 'ol', 'strong', 'style', 'ul']
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'abbr': ['title'],
    'img': ['src', 'title'],
    'style': ['media']
}
STRIPPED_CONTENTS = ['script']

class DescriptionHTMLSanitizer(HTMLParser):
    """
    Strip all tags not in ALLOWED_TAGS.
    Accept attributes in ALLOWED_ATTRIBUTES.
    For 'a': only accept local links to fragments, ie '#myanchor'.
    Case tag in STRIPPED_CONTENTS, also strip tag contents.
    """
    def __init__(self, allowed_tags = ALLOWED_TAGS,
                 allowed_attributes = ALLOWED_ATTRIBUTES,
                 stripped_contents = STRIPPED_CONTENTS
    ):
        super(DescriptionHTMLSanitizer, self).__init__()
        self.allowed_tags = allowed_tags
        self.allowed_attributes = allowed_attributes
        self.stripped_contents = stripped_contents
        self.output = ""

    def clear(self):
        self.output = ""

    def handle_starttag(self, tag, attrs):
        if not tag in self.allowed_tags:
            return
        self.output += '<' + tag
        for attr in attrs:
            if not (tag in self.allowed_attributes and \
               attr[0] in self.allowed_attributes[tag]):
                continue
            if tag == 'a' and attr[0] == 'href':
                if not attr[1].startswith('#'):
                    continue
            self.output += ' %s="%s"' % (attr)
        self.output += '>'

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.output = self.output[:-1] + '/>'

    def handle_endtag(self, tag):
        if tag in self.allowed_tags:
            self.output += '</' + tag + '>'

    def handle_data(self, data):
        last_start_tag = self.get_starttag_text()
        if last_start_tag and len(last_start_tag) > 2:
            last_start_tag = last_start_tag[1:-1]
        if last_start_tag in self.stripped_contents:
            return
        self.output += data

html_sanitizer = DescriptionHTMLSanitizer()

def sanitize(s):
    html_sanitizer.clear()
    html_sanitizer.feed(s)
    html_sanitizer.close()
    return html_sanitizer.output
