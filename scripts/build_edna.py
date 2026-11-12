"""HISTORICAL. Do not run this script.

The storefront theme is now edited directly (see docs/THEME_PLAN.md). Running this generator
would overwrite hand-built sections, templates, the header, footer and layout with the earlier
concept-collection versions.
"""
from pathlib import Path
import json
import re
import shutil
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
THEME = ROOT / 'theme'
CHANGED = []

def write(name, content):
    path = THEME / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + '\n', encoding='utf-8')
    CHANGED.append(name)

def read_json(name):
    text = re.sub(r'/\*.*?\*/', '', (THEME / name).read_text(encoding='utf-8'), flags=re.S)
    text = re.sub(r'^\s*//.*$', '', text, flags=re.M)
    text = re.sub(r',(?=\s*[}\]])', '', text)
    return json.loads(text)

def setting(kind, key, label, default=None, **kwargs):
    item = {'type': kind, 'id': key, 'label': label, **kwargs}
    if default is not None:
        item['default'] = default
    return item

def section(name, markup, settings=None, blocks=None, limit=None):
    schema = {'name': name, 'settings': settings or [], 'presets': [{'name': name}]}
    if blocks:
        schema['blocks'] = blocks
    if limit:
        schema['max_blocks'] = limit
    return markup.strip() + '\n{% schema %}\n' + json.dumps(schema, indent=2) + '\n{% endschema %}'

def main():
    board = THEME / 'assets/edna-identity-board.jpg'
    if not board.exists():
        raise RuntimeError('Run scripts/prepare_assets.ps1 to encode the supplied brand board for the web.')
    CHANGED.append('assets/edna-identity-board.jpg')
    source = ET.fromstring((ROOT / 'ASSETS/01_EDNA_master_logo_charcoal.svg').read_text())
    ns = '{http://www.w3.org/2000/svg}'
    paths = ''.join(ET.tostring(x, encoding='unicode') for x in source if x.tag == ns + 'path' and 'transform' in x.attrib)
    paths = paths.replace('ns0:', '').replace(':ns0', '').replace(' xmlns="http://www.w3.org/2000/svg"', '')
    paths = paths.replace('#EEE7DD', '#211C19').replace('#C8B6A1', '#796B62')
    write('assets/edna-wordmark.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="210 185 580 210">' + paths + '</svg>')
    mono = (ROOT / 'ASSETS/02_EDNA_monogram_dark.svg').read_text()
    write('assets/edna-monogram.svg', mono)

    write('snippets/edna-icon.liquid', r'''
{% doc %}
  Renders an EDNA interface icon.
  @param {string} name - Icon name
{% enddoc %}
<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true" focusable="false">
  {% case name %}
    {% when 'bag' %}<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>
    {% when 'search' %}<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>
    {% when 'heart' %}<path d="M20.6 5.5c-2-2-5.2-1.8-7.1.2L12 7.2l-1.5-1.5C8.6 3.7 5.4 3.5 3.4 5.5c-2 2-1.8 5.2.2 7.1L12 21l8.4-8.4c2-1.9 2.2-5.1.2-7.1Z"/>
    {% when 'menu' %}<path d="M3 8h18M3 16h18"/>
    {% when 'close' %}<path d="m5 5 14 14M19 5 5 19"/>
    {% when 'arrow' %}<path d="M3 12h17m-6-6 6 6-6 6"/>
  {% endcase %}
</svg>
''')
    write('snippets/edna-board-crop.liquid', r'''
{% doc %}
  Displays a panel of the supplied EDNA identity board without altering its source artwork.
  @param {string} panel - Campaign, packaging, detail, or evening panel
  @param {string} label - Accessible description
  @param {boolean} [priority] - Eagerly load the campaign panel
{% enddoc %}
{% liquid
  assign crop = '0 0 427 597'
  case panel
    when 'packaging'
      assign crop = '429 312 632 323'
    when 'detail'
      assign crop = '819 778 237 246'
    when 'evening'
      assign crop = '1058 778 231 246'
  endcase
%}
<svg class="edna-board-crop" viewBox="{{ crop }}" preserveAspectRatio="{% if priority %}xMaxYMax slice{% else %}xMidYMid slice{% endif %}" role="img" aria-label="{{ label | escape }}">
  <image href="{{ 'edna-identity-board.jpg' | asset_url }}" width="1535" height="1024" {% if priority %}fetchpriority="high"{% endif %}/>
</svg>
''')
    write('snippets/edna-product-card.liquid', r'''
{% doc %}
  Renders a real product with a device-local wishlist control.
  @param {product} item - Shopify product
{% enddoc %}
<article class="edna-product">
  <div class="edna-product-media">
    <a href="{{ item.url }}" aria-label="{{ item.title | escape }}">
      {% if item.featured_image %}
        {{ item.featured_image | image_url: width: 1200 | image_tag: loading: 'lazy', widths: '320,480,640,900,1200', sizes: '(max-width: 749px) 46vw, 43vw', class: 'edna-product-image' }}
      {% else %}<span class="edna-no-image">{{ 'edna.general.image_pending' | t }}</span>{% endif %}
    </a>
    <button type="button" class="edna-icon-button edna-save" data-edna-save data-product-url="{{ item.url }}" data-product-title="{{ item.title | escape }}" aria-label="{{ 'edna.wishlist.save' | t: title: item.title | escape }}" aria-pressed="false" hidden>{% render 'edna-icon', name: 'heart' %}</button>
    {% unless item.available %}<span class="edna-sold-out">{{ 'edna.general.sold_out' | t }}</span>{% endunless %}
  </div>
  <div class="edna-product-caption"><h3><a href="{{ item.url }}">{{ item.title | escape }}</a></h3><span>{% if item.price_varies %}{{ 'edna.general.from' | t }} {% endif %}{{ item.price | money_with_currency }}</span></div>
</article>
''')
    write('sections/edna-header.liquid', section('EDNA header', r'''
<header class="edna edna-header">
  <div class="edna-header-left">
    <details class="edna-menu">
      <summary class="edna-icon-button" aria-label="{{ 'edna.general.menu' | t }}">{% render 'edna-icon', name: 'menu' %}</summary>
      <nav class="edna-menu-panel" aria-label="{{ 'edna.general.menu' | t }}">
        {% if section.settings.menu != blank %}
          {% for link in section.settings.menu.links %}<a href="{{ link.url }}">{{ link.title | escape }}</a>{% endfor %}
        {% else %}<a href="{{ routes.root_url }}">{{ 'edna.general.home' | t }}</a><a href="{{ routes.all_products_collection_url }}">{{ 'edna.general.collection' | t }}</a>{% endif %}
        <button type="button" class="edna-text-button" data-edna-wishlist hidden>{{ 'edna.wishlist.title' | t }}</button>
      </nav>
    </details>
    <a class="edna-header-label" href="{{ routes.all_products_collection_url }}">{{ 'edna.general.collection' | t }}</a>
  </div>
  <a class="edna-logo" href="{{ routes.root_url }}" aria-label="EDNA — {{ 'edna.general.home' | t }}">
    {% if section.settings.logo %}{{ section.settings.logo | image_url: width: 440 | image_tag: widths: '220,440', sizes: '150px', loading: 'eager', alt: 'EDNA Footwear' }}{% else %}<img src="{{ 'edna-wordmark.svg' | asset_url }}" width="150" height="54" alt="EDNA Footwear">{% endif %}
  </a>
  <div class="edna-header-right">
    <details class="edna-search">
      <summary class="edna-icon-button" aria-label="{{ 'edna.general.search' | t }}">{% render 'edna-icon', name: 'search' %}</summary>
      <form action="{{ routes.search_url }}" method="get" role="search" class="edna-search-panel">
        <label for="EdnaSearch">{{ 'edna.general.search' | t }}</label><input id="EdnaSearch" type="search" name="q" required autocomplete="off"><input type="hidden" name="type" value="product"><button type="submit" class="edna-icon-button" aria-label="{{ 'edna.general.search' | t }}">{% render 'edna-icon', name: 'arrow' %}</button>
      </form>
    </details>
    <a class="edna-icon-button edna-bag" href="{{ routes.cart_url }}" aria-label="{{ 'edna.general.bag' | t }}">{% render 'edna-icon', name: 'bag' %}<span class="edna-bag-count">{{ cart.item_count }}</span></a>
  </div>
</header>
<dialog class="edna edna-wishlist" data-edna-wishlist-dialog>
  <div class="edna-dialog-heading"><h2>{{ 'edna.wishlist.title' | t }}</h2><button type="button" class="edna-icon-button" data-edna-close aria-label="{{ 'edna.general.close' | t }}">{% render 'edna-icon', name: 'close' %}</button></div>
  <p>{{ 'edna.wishlist.device_note' | t }}</p><ul data-edna-saved-list></ul><p data-edna-saved-empty>{{ 'edna.wishlist.empty' | t }}</p>
</dialog>
<div class="edna-visually-hidden" data-edna-status role="status" aria-live="polite" data-saved="{{ 'edna.wishlist.saved' | t }}" data-removed="{{ 'edna.wishlist.removed' | t }}" data-unavailable="{{ 'edna.wishlist.unavailable' | t }}"></div>
''', [setting('image_picker','logo','Logo override'), setting('link_list','menu','Navigation menu')]))

    write('sections/edna-campaign.liquid', section('EDNA campaign', r'''
{% assign catalog = collections['all'] %}
<section class="edna edna-campaign{% if section.settings.full_bleed %} edna-campaign-full{% endif %}" style="--campaign-height: {{ section.settings.height }}svh; --campaign-focus: {{ section.settings.image.presentation.focal_point | default: '50% 50%' }};">
  <div class="edna-campaign-media">
    {% if section.settings.image %}
      {{ section.settings.image | image_url: width: 2400 | image_tag: loading: 'eager', fetchpriority: 'high', widths: '640,960,1440,1920,2400', sizes: '100vw' }}
    {% else %}{% assign campaign_label = 'edna.campaign.concept_alt' | t %}{% render 'edna-board-crop', panel: 'campaign', label: campaign_label, priority: true %}{% endif %}
    <span class="edna-campaign-caption">{{ section.settings.caption | escape }}</span>
  </div>
  <div class="edna-campaign-copy">
    <p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p>
    <h1>{{ section.settings.heading | escape | newline_to_br }}</h1>
    <p class="edna-campaign-description">{{ section.settings.description | escape }}</p>
    {% if catalog.products_count > 0 %}<a class="edna-button" href="{{ section.settings.link | default: routes.all_products_collection_url }}">{{ 'edna.campaign.shop' | t }}{% render 'edna-icon', name: 'arrow' %}</a>{% else %}<a class="edna-button" href="#edna-newsletter">{{ 'edna.campaign.discover' | t }}{% render 'edna-icon', name: 'arrow' %}</a>{% endif %}
    <span class="edna-campaign-index">01 / EDNA</span>
  </div>
</section>
{% if section.settings.video != blank %}<div class="edna edna-campaign-film">{{ section.settings.video | video_tag: controls: true, muted: true, preload: 'none', image_size: '1200x' }}</div>{% endif %}
''', [setting('image_picker','image','Campaign photograph'),setting('video','video','Optional campaign film'),setting('checkbox','full_bleed','Full-width photograph',False),setting('range','height','Hero height',72,min=65,max=75,step=1,unit='vh'),setting('text','eyebrow','Eyebrow','EDNA / THE FIRST CHAPTER'),setting('textarea','heading','Headline','For every\nside of you.'),setting('textarea','description','Introduction','A quieter kind of statement. Footwear for the way you move through the world.'),setting('text','caption','Photograph caption','EDNA — A STUDY IN CONTRAST'),setting('url','link','New arrivals collection')]))

    collection_blocks = [{'type':'collection','name':'Collection','settings':[setting('text','title','Title'),setting('collection','collection','Collection'),setting('image_picker','image','Editorial image')]}]
    write('sections/edna-collections.liquid', section('EDNA shopping shortcuts', r'''
{% liquid
  assign visible_count = 0
  for block in section.blocks
    if block.settings.collection.products_count > 0
      assign visible_count = visible_count | plus: 1
    endif
  endfor
%}
{% if visible_count > 0 or request.design_mode %}
<section class="edna edna-section edna-collections{% if section.settings.occasion %} edna-occasions{% endif %}">
  <div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2></div><p>{{ section.settings.description | escape }}</p></div>
  <div class="edna-category-grid">
    {% for block in section.blocks %}
      {% assign chosen = block.settings.collection %}
      {% if chosen.products_count > 0 %}
        {% assign card_image = block.settings.image | default: chosen.featured_image %}
        <a class="edna-category" href="{{ chosen.url }}" {{ block.shopify_attributes }}>
          {% if card_image %}{{ card_image | image_url: width: 900 | image_tag: loading: 'lazy', widths: '320,480,640,900', sizes: '(max-width: 749px) 45vw, 23vw' }}{% endif %}
          <span>{{ block.settings.title | default: chosen.title | escape }}{% render 'edna-icon', name: 'arrow' %}</span>
        </a>
      {% elsif request.design_mode %}
        <div class="edna-category edna-category-placeholder" {{ block.shopify_attributes }}><span>{{ block.settings.title | escape }}</span><small>{{ 'edna.editor.collection' | t }}</small></div>
      {% endif %}
    {% endfor %}
  </div>
</section>
{% endif %}
''', [setting('text','eyebrow','Eyebrow','FIND YOUR FORM'),setting('text','heading','Heading','Shop by style'),setting('textarea','description','Description','A different mood. The same point of view.'),setting('checkbox','occasion','Use occasion styling',False)],collection_blocks,4))

    write('sections/edna-edit.liquid', section('The EDNA Edit', r'''
{% assign selected_collection = section.settings.collection %}
{% if selected_collection.products_count > 0 or request.design_mode %}
<section class="edna edna-section edna-edit" id="edna-edit">
  <div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2></div>{% if selected_collection.products_count > 0 %}<a class="edna-link" href="{{ selected_collection.url }}">{{ 'edna.general.view_collection' | t }}{% render 'edna-icon', name: 'arrow' %}</a>{% endif %}</div>
  {% if selected_collection.products_count > 0 %}<div class="edna-product-grid">{% for item in selected_collection.products limit: section.settings.limit %}{% render 'edna-product-card', item: item %}{% endfor %}</div>{% else %}<p class="edna-editor-note">{{ 'edna.editor.products' | t }}</p>{% endif %}
</section>
{% endif %}
''', [setting('text','eyebrow','Eyebrow','CONSIDERED. SELECTED. EDNA.'),setting('text','heading','Heading','The EDNA Edit'),setting('collection','collection','Selected products'),setting('range','limit','Number of products',4,min=4,max=6,step=1)]))

    write('sections/edna-signature.liquid', section('EDNA signature shoe', r'''
{% assign signature = section.settings.product %}
{% if signature != blank or request.design_mode %}
<section class="edna edna-signature">
  <div class="edna-signature-media">
    {% assign signature_image = section.settings.image | default: signature.featured_image %}
    {% if signature_image %}{{ signature_image | image_url: width: 1600 | image_tag: loading: 'lazy', widths: '480,800,1200,1600', sizes: '(max-width: 749px) 100vw, 60vw' }}{% else %}{% assign detail_label = 'edna.signature.concept_alt' | t %}{% render 'edna-board-crop', panel: 'detail', label: detail_label %}{% endif %}
  </div>
  <div class="edna-signature-copy"><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2><p>{{ section.settings.description | escape }}</p>
    {% if signature != blank %}<a class="edna-link" href="{{ signature.url }}">{{ signature.title | escape }}{% render 'edna-icon', name: 'arrow' %}</a>{% elsif request.design_mode %}<p class="edna-editor-note">{{ 'edna.editor.signature' | t }}</p>{% endif %}
    {% if section.settings.video %}{{ section.settings.video | video_tag: controls: true, muted: true, preload: 'none', image_size: '800x' }}{% endif %}
  </div>
</section>
{% endif %}
''', [setting('product','product','Signature product'),setting('image_picker','image','Detail photograph'),setting('video','video','On-foot film'),setting('text','eyebrow','Eyebrow','THE DETAIL THAT CHANGES EVERYTHING'),setting('text','heading','Headline','A moment,\nmade yours.'),setting('textarea','description','Story','An unexpected line. A considered silhouette. A pair that makes the whole look feel like you.')]))

    write('sections/edna-stories.liquid', section('Two sides of EDNA', r'''
<section class="edna edna-section edna-stories" id="edna-stories">
  <div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2></div><p>{{ section.settings.description | escape }}</p></div>
  <div class="edna-story-grid">
    {% for block in section.blocks %}
      <article class="edna-story edna-story-{{ block.settings.tone }}" {{ block.shopify_attributes }}>
        <div class="edna-story-media">
          {% if block.settings.image %}{{ block.settings.image | image_url: width: 1200 | image_tag: loading: 'lazy', widths: '480,800,1200', sizes: '(max-width: 749px) 100vw, 46vw' }}{% else %}{% assign story_label = 'edna.stories.concept_alt' | t %}{% if forloop.first %}{% render 'edna-board-crop', panel: 'campaign', label: story_label %}{% else %}{% render 'edna-board-crop', panel: 'evening', label: story_label %}{% endif %}{% endif %}
        </div>
        <div class="edna-story-caption"><span class="edna-eyebrow">0{{ forloop.index }}</span><h3>{{ block.settings.title | escape }}</h3><p>{{ block.settings.description | escape }}</p>{% if block.settings.collection.products_count > 0 %}<a class="edna-link" href="{{ block.settings.collection.url }}">{{ 'edna.stories.explore' | t }}{% render 'edna-icon', name: 'arrow' %}</a>{% endif %}</div>
      </article>
    {% endfor %}
  </div>
</section>
''',[setting('text','eyebrow','Eyebrow','ONE POINT OF VIEW. EVERY SIDE OF YOU.'),setting('text','heading','Heading','Two sides. Always EDNA.'),setting('textarea','description','Introduction','Refinement has a rebellious side.')],[{'type':'story','name':'Editorial story','settings':[setting('text','title','Title'),setting('textarea','description','Description'),setting('image_picker','image','Editorial photograph'),setting('collection','collection','Shop this edit'),setting('select','tone','Tone','light',options=[{'value':'light','label':'Ivory'},{'value':'dark','label':'Olive'}])]}],2))

    write('sections/edna-confidence.liquid', section('EDNA confidence and fit', r'''
{% if section.blocks.size > 0 %}
<section class="edna edna-section edna-confidence"><div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2></div></div><div class="edna-confidence-grid">
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'review' %}{% if block.settings.quote != blank and block.settings.consent %}<figure {{ block.shopify_attributes }}>{% if block.settings.image %}{{ block.settings.image | image_url: width: 700 | image_tag: loading: 'lazy' }}{% endif %}<blockquote>{{ block.settings.quote | escape }}</blockquote><figcaption>{{ block.settings.name | escape }}{% if block.settings.fit != blank %} / {{ block.settings.fit | escape }}{% endif %}</figcaption></figure>{% endif %}
      {% when 'information' %}{% if block.settings.body != blank %}<details {{ block.shopify_attributes }}><summary>{{ block.settings.title | escape }}<span aria-hidden="true">+</span></summary><div class="edna-information-body">{{ block.settings.body }}</div></details>{% endif %}
    {% endcase %}
  {% endfor %}
</div></section>
{% elsif request.design_mode %}<section class="edna edna-section"><p class="edna-editor-note">{{ 'edna.editor.confidence' | t }}</p></section>{% endif %}
''',[setting('text','eyebrow','Eyebrow','THE FINER DETAILS'),setting('text','heading','Heading','Good to know.')],[{'type':'information','name':'Fit or policy information','settings':[setting('text','title','Heading'),setting('richtext','body','Verified information')]},{'type':'review','name':'Real customer story','settings':[setting('image_picker','image','Customer photograph'),setting('textarea','quote','Actual customer words'),setting('text','name','Customer display name'),setting('text','fit','Fit feedback'),setting('checkbox','consent','Customer consent obtained',False)]}],8))

    write('sections/edna-footer.liquid', section('EDNA footer', r'''
<footer class="edna edna-footer">
  <section class="edna-newsletter" id="edna-newsletter"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2><p>{{ section.settings.description | escape }}</p></div>
    {% form 'customer', id: 'EdnaNewsletter', class: 'edna-newsletter-form' %}
      <input type="hidden" name="contact[tags]" value="newsletter,edna-first-chapter">
      {% if form.posted_successfully? %}<p role="status">{{ 'edna.newsletter.success' | t }}</p>{% else %}
        <label for="EdnaEmail" class="edna-visually-hidden">{{ 'edna.newsletter.email' | t }}</label>
        <div class="edna-email-field"><input id="EdnaEmail" type="email" name="contact[email]" placeholder="{{ 'edna.newsletter.email' | t }}" required autocomplete="email" {% if form.errors %}aria-invalid="true" aria-describedby="EdnaEmailError"{% endif %}><button type="submit" class="edna-icon-button" aria-label="{{ 'edna.newsletter.subscribe' | t }}">{% render 'edna-icon', name: 'arrow' %}</button></div>
        {% if form.errors %}<div id="EdnaEmailError" role="alert">{{ form.errors | default_errors }}</div>{% endif %}
        <p class="edna-fine-print">{{ 'edna.newsletter.consent' | t }}{% if shop.privacy_policy != blank %} <a href="{{ shop.privacy_policy.url }}">{{ 'edna.general.privacy' | t }}</a>{% endif %}</p>
      {% endif %}
    {% endform %}
  </section>
  <div class="edna-footer-main"><div class="edna-footer-brand"><img src="{{ 'edna-wordmark.svg' | asset_url }}" width="200" height="72" loading="lazy" alt="EDNA Footwear"><p>{{ section.settings.brand_line | escape }}</p></div>
    <nav aria-label="{{ 'edna.general.footer' | t }}">{% for link in section.settings.menu.links %}<a href="{{ link.url }}">{{ link.title | escape }}</a>{% endfor %}{% for policy in shop.policies %}{% if policy.body != blank %}<a href="{{ policy.url }}">{{ policy.title | escape }}</a>{% endif %}{% endfor %}{% if section.settings.instagram != blank %}<a href="{{ section.settings.instagram }}" target="_blank" rel="noopener">{{ 'edna.general.instagram' | t }} ↗</a>{% endif %}</nav>
  </div>
  <div class="edna-footer-bottom"><span>© {{ 'now' | date: '%Y' }} EDNA</span><span>{{ localization.country.name | escape }} / {{ localization.country.currency.iso_code }}</span><a href="#MainContent">{{ 'edna.general.back_top' | t }} ↑</a></div>
</footer>
''',[setting('text','eyebrow','Eyebrow','LET THE NEXT CHAPTER FIND YOU'),setting('text','heading','Heading','A place on the list.'),setting('textarea','description','Invitation','Be the first to discover the EDNA collection, new stories and considered arrivals.'),setting('text','brand_line','Brand line','For every side of you.'),setting('link_list','menu','Footer navigation'),setting('url','instagram','Actual Instagram profile')]))

    locales = read_json('locales/en.default.json')
    locales['edna'] = {
      'general':{'menu':'Menu','home':'Home','collection':'The collection','search':'Search','bag':'Shopping bag','close':'Close','image_pending':'Photograph coming soon','sold_out':'Sold out','from':'From','view_collection':'Explore the collection','footer':'Footer navigation','privacy':'Privacy policy','instagram':'Instagram','back_top':'Back to top'},
      'campaign':{'shop':'Shop New Arrivals','discover':'Discover the first chapter','concept_alt':'EDNA campaign concept from the supplied brand identity board'},
      'signature':{'concept_alt':'EDNA footwear detail concept from the brand identity board'},
      'stories':{'explore':'Explore the edit','concept_alt':'EDNA editorial concept from the brand identity board'},
      'editor':{'collection':'Select a collection with products. This tile stays hidden on the storefront until then.','products':'Choose a collection of four to six real products. Product cards, PKR prices and wishlist controls appear automatically.','signature':'Select a real signature product and add its detail photograph and optional on-foot film.','confidence':'Add approved fit, material, delivery and exchange information here. Customer stories appear only when you add real words and confirm consent.'},
      'wishlist':{'title':'Saved styles','save':'Save {{ title }}','device_note':'Your saved styles are stored in this browser on this device.','empty':'Save a style using the heart beside it.','saved':'Style saved.','removed':'Style removed from saved styles.','unavailable':'Your browser could not save this style. Please allow local storage and try again.'},
      'newsletter':{'email':'Your email address','subscribe':'Join the list','success':"You’re on the list. We’ll be in touch.",'consent':'By joining, you agree to receive EDNA emails. You can unsubscribe at any time.'}
    }
    write('locales/en.default.json',json.dumps(locales,ensure_ascii=False,indent=2))
    sections = {
      'campaign':{'type':'edna-campaign','settings':{}},
      'styles':{'type':'edna-collections','settings':{},'blocks':{},'block_order':[]},
      'edit':{'type':'edna-edit','settings':{'collection':'frontpage','limit':4}},
      'signature':{'type':'edna-signature','settings':{}},
      'stories':{'type':'edna-stories','settings':{},'blocks':{'quiet':{'type':'story','settings':{'title':'The Quiet Edit','description':'Soft lines. Modern occasionwear. An understated way to make an entrance.','tone':'light'}},'unexpected':{'type':'story','settings':{'title':'The Unexpected Edit','description':'An offbeat detail. A different pairing. A little room for instinct.','tone':'dark'}}},'block_order':['quiet','unexpected']},
      'occasions':{'type':'edna-collections','settings':{'eyebrow':'WHERE WILL YOU TAKE THEM?','heading':'Dress for the moment.','description':'Start with the occasion. Find your own way there.','occasion':True},'blocks':{},'block_order':[]},
      'confidence':{'type':'edna-confidence','settings':{}}
    }
    for name, titles in [('styles',['Heels & Evening','Flats & Mules','Bold & Street','Sandals']),('occasions',['Wedding Guest','Everyday','After Dark','Weekend'])]:
        for i,title in enumerate(titles):
            key='collection_'+str(i+1)
            sections[name]['blocks'][key]={'type':'collection','settings':{'title':title}}
            sections[name]['block_order'].append(key)
    write('templates/index.json',json.dumps({'sections':sections,'order':list(sections)},indent=2))
    write('sections/header-group.json',json.dumps({'type':'header','name':'EDNA header','sections':{'header':{'type':'edna-header','settings':{}}},'order':['header']},indent=2))
    write('sections/footer-group.json',json.dumps({'type':'footer','name':'EDNA footer','sections':{'footer':{'type':'edna-footer','settings':{}}},'order':['footer']},indent=2))
    data=read_json('config/settings_data.json')
    data['current'].update({'color_palette':{'background':'#FAF7F1','foreground':'#211C19','color1':'#6F6359','color2':'#D9CEC0'},'primary_button_border_width':1,'button_border_radius_primary':0,'button_border_radius_secondary':0,'inputs_border_radius':0,'currency_code_enabled_product_pages':True,'currency_code_enabled_product_cards':True,'currency_code_enabled_cart_items':True,'card_corner_radius':0})
    write('config/settings_data.json',json.dumps(data,indent=2))
    layout=(THEME/'layout/theme.liquid').read_text(encoding='utf-8')
    if "'edna.css'" not in layout:
        layout=layout.replace('{{ content_for_header }}',"{{ 'edna.css' | asset_url | stylesheet_tag }}\n    <script src=\"{{ 'edna.js' | asset_url }}\" defer></script>\n    {{ content_for_header }}")
        layout=layout.replace('class="page-width-', 'class="edna-storefront page-width-')
    layout=layout.replace("<footer>\n        {% sections 'footer-group' %}\n      </footer>", "<div class=\"edna-footer-group\">\n        {% sections 'footer-group' %}\n      </div>")
    write('layout/theme.liquid',layout)
    write('assets/edna.js',r'''
(() => {
  if (window.ednaInitialized) return;
  window.ednaInitialized = true;
  const key = 'edna:saved-styles:v1';
  let saved = [];
  const valid = (item) => item && typeof item.title === 'string' && typeof item.url === 'string' && item.url.startsWith('/') && !item.url.startsWith('//');
  try { const data = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(data)) saved = data.filter(valid).slice(0, 100); } catch {}
  const announce = (message) => { const status = document.querySelector('[data-edna-status]'); if (status) status.textContent = status.dataset[message] || ''; };
  const refresh = () => {
    document.querySelectorAll('[data-edna-save]').forEach((button) => { button.hidden = false; button.setAttribute('aria-pressed', String(saved.some((item) => item.url === button.dataset.productUrl))); });
    document.querySelectorAll('[data-edna-wishlist]').forEach((button) => { button.hidden = false; });
    const list = document.querySelector('[data-edna-saved-list]');
    if (list) { list.replaceChildren(); saved.forEach((item) => { const li = document.createElement('li'); const a = document.createElement('a'); a.href = item.url; a.textContent = item.title; li.append(a); list.append(li); }); }
    const empty = document.querySelector('[data-edna-saved-empty]'); if (empty) empty.hidden = saved.length > 0;
  };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edna-save]');
    if (button) {
      const item = { url: button.dataset.productUrl, title: button.dataset.productTitle };
      if (!valid(item)) return;
      const exists = saved.some((entry) => entry.url === item.url);
      const next = exists ? saved.filter((entry) => entry.url !== item.url) : [...saved, item].slice(-100);
      try { localStorage.setItem(key, JSON.stringify(next)); saved = next; refresh(); announce(exists ? 'removed' : 'saved'); } catch { announce('unavailable'); }
    }
    if (event.target.closest('[data-edna-wishlist]')) {
      const dialog = document.querySelector('[data-edna-wishlist-dialog]');
      if (dialog && !dialog.open) dialog.showModal();
    }
    if (event.target.closest('[data-edna-close]')) document.querySelector('[data-edna-wishlist-dialog]')?.close();
  });
  document.addEventListener('shopify:section:load', refresh);
  window.addEventListener('storage', (event) => { if (event.key !== key) return; try { const data = JSON.parse(event.newValue || '[]'); saved = Array.isArray(data) ? data.filter(valid).slice(0, 100) : []; refresh(); } catch {} });
  refresh();
})();
''')
    CHANGED.append('assets/edna.css')
    (ROOT/'.agent/changed-theme-files.json').write_text(json.dumps(CHANGED,indent=2))
    print(json.dumps({'created':len(CHANGED),'files':CHANGED},indent=2))

if __name__ == '__main__':
    main()
