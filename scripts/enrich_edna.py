"""HISTORICAL. Do not run this script.

The storefront theme is now edited directly (see docs/THEME_PLAN.md). Running this generator
would overwrite hand-built sections, templates, the header, footer and layout with the earlier
concept-collection versions.
"""
from pathlib import Path
import json
import shutil
from build_edna import section, setting, read_json

ROOT = Path(__file__).resolve().parents[1]
THEME = ROOT / 'theme'
KIT = ROOT / 'ASSETS/New folder/EDNA_digital_brand_assets'
changed = []

def write(name, text):
    (THEME / name).parent.mkdir(parents=True, exist_ok=True)
    (THEME / name).write_text(text.strip() + '\n', encoding='utf-8')
    changed.append(name)

def copy(source, target):
    shutil.copyfile(KIT / source, THEME / ('assets/' + target))
    changed.append('assets/' + target)

def main():
    products = json.loads((ROOT / 'catalog/concepts.json').read_text(encoding='utf-8'))
    copies = {
        '05_website/website_header_logo_charcoal_transparent.svg':'edna-header-logo.svg',
        '05_website/website_mobile_logo_charcoal_transparent.svg':'edna-mobile-logo.svg',
        '05_website/website_footer_logo_ivory_transparent.svg':'edna-footer-logo.svg',
        '05_website/website_share_preview_1200x630.png':'edna-share-preview.png',
        '07_brand_backgrounds/pattern_olive_1600.svg':'edna-pattern-olive.svg',
        '07_brand_backgrounds/pattern_ivory_1600.svg':'edna-pattern-ivory.svg',
        '06_favicons/favicon_32.png':'edna-favicon-32.png',
        '06_favicons/apple_touch_icon_180.png':'edna-apple-touch.png',
        '06_favicons/favicon_512.svg':'edna-favicon.svg',
        '02_social_feed/02_signature_geometry.svg':'edna-house-geometry.svg'
    }
    for source, target in copies.items(): copy(source, target)
    changed.extend('assets/edna-' + p['slug'] + '.jpg' for p in products)
    changed.extend(['assets/edna-campaign.jpg','assets/edna-mobile-campaign.jpg','assets/edna-street-editorial.jpg'])

    write('sections/edna-concept-campaign.liquid', section('EDNA collection campaign', r'''
<section class="edna edna-new-campaign" style="--edna-campaign-height: {{ section.settings.height }}svh;">
  <picture><source media="(max-width: 749px)" srcset="{{ 'edna-mobile-campaign.jpg' | asset_url }}"><img src="{{ 'edna-campaign.jpg' | asset_url }}" width="1774" height="887" alt="{{ 'edna.collection.campaign_alt' | t }}" loading="eager" fetchpriority="high"></picture>
  <div class="edna-new-campaign-copy"><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h1>{{ section.settings.heading | escape | newline_to_br }}</h1><p>{{ section.settings.introduction | escape }}</p><a href="#edna-edit" class="edna-button">{{ 'edna.collection.explore' | t }}{% render 'edna-icon', name: 'arrow' %}</a></div>
  <div class="edna-campaign-folio"><span>{{ 'edna.collection.chapter' | t }}</span><span>01 / 12</span></div>
</section>
<p class="edna edna-collection-notice">{{ 'edna.collection.notice' | t }}</p>
''',[setting('text','eyebrow','Eyebrow','EDNA / COLLECTION NO. 01'),setting('textarea','heading','Headline','Every side\nof you.'),setting('textarea','introduction','Introduction','Quiet confidence. Unexpected edges. A world of footwear, through an EDNA lens.'),setting('range','height','Campaign height',72,min=65,max=75,step=1,unit='vh')]))

    write('sections/edna-concept-shortcuts.liquid', section('EDNA collection shortcuts',r'''
<section class="edna edna-section edna-new-shortcuts{% if section.settings.occasion %} edna-new-occasions{% endif %}">
  <div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2></div><p>{{ section.settings.introduction | escape }}</p></div>
  <div class="edna-new-shortcut-grid">
    {% for block in section.blocks %}<a href="#edna-edit" class="edna-new-shortcut" data-edna-collection-filter="{{ block.settings.filter | escape }}" {{ block.shopify_attributes }}>
      <div><img src="{{ block.settings.image_asset | asset_url }}" width="1122" height="1402" alt="{{ block.settings.title | escape }} — {{ 'edna.collection.concept_image' | t }}" loading="lazy"></div><span>{{ block.settings.title | escape }}{% render 'edna-icon', name: 'arrow' %}</span>
    </a>{% endfor %}
  </div>
</section>
''',[setting('text','eyebrow','Eyebrow','A DIFFERENT MOOD. THE SAME POINT OF VIEW.'),setting('text','heading','Heading','Find your form.'),setting('textarea','introduction','Introduction','From a quiet entrance to an unexpected turn.'),setting('checkbox','occasion','Occasion layout',False)],[{'type':'shortcut','name':'Collection shortcut','settings':[setting('text','title','Title'),setting('text','filter','Collection filter'),setting('text','image_asset','Theme image filename')]}],6))

    write('sections/edna-concept-catalog.liquid',section('EDNA concept collection',r'''
<section class="edna edna-section edna-new-catalog" id="edna-edit" data-edna-catalog data-limit="{{ section.settings.initial_count }}">
  <div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2 tabindex="-1" data-edna-catalog-heading>{{ section.settings.heading | escape }}</h2></div><p>{{ section.settings.introduction | escape }}</p></div>
  <div class="edna-catalog-tools"><button type="button" class="edna-filter-reset" data-edna-collection-filter="all" aria-pressed="true">{{ 'edna.collection.all_styles' | t }}</button><span data-edna-filter-label></span><span role="status" aria-live="polite" data-edna-result-count data-count-label="{{ 'edna.collection.count' | t }}"></span></div>
  <div class="edna-product-grid">
    {% for block in section.blocks %}
      <article class="edna-product edna-concept-card" id="edna-{{ block.settings.slug }}" data-category="{{ block.settings.category | escape }}" data-occasions="{{ block.settings.occasions | escape }}" data-edit="{{ block.settings.edit | escape }}" data-search="{{ block.settings.title | escape }} {{ block.settings.subtitle | escape }} {{ block.settings.description | escape }}" {{ block.shopify_attributes }}>
        <div class="edna-product-media"><a href="#edna-{{ block.settings.slug }}" data-edna-open-style="{{ block.settings.slug }}" aria-label="{{ 'edna.collection.view_style' | t: title: block.settings.title | escape }}"><img src="{{ block.settings.image_asset | asset_url }}" width="1122" height="1402" loading="lazy" alt="{{ block.settings.title | escape }} — {{ 'edna.collection.concept_image' | t }}"></a><button type="button" class="edna-icon-button edna-save" data-edna-save data-product-url="{{ routes.root_url }}#edna-{{ block.settings.slug }}" data-product-title="{{ block.settings.title | escape }}" aria-label="{{ 'edna.wishlist.save' | t: title: block.settings.title | escape }}" aria-pressed="false" hidden>{% render 'edna-icon', name: 'heart' %}</button></div>
        <div class="edna-product-caption"><h3><a href="#edna-{{ block.settings.slug }}" data-edna-open-style="{{ block.settings.slug }}">{{ block.settings.title | escape }}</a></h3><span>{{ block.settings.price | times: 100 | money_with_currency }}</span></div><p class="edna-concept-type">{{ block.settings.subtitle | escape }}</p>
        <noscript><p>{{ block.settings.description | escape }}</p></noscript>
        <template id="EdnaStyle-{{ block.settings.slug }}"><div class="edna-style-detail"><img src="{{ block.settings.image_asset | asset_url }}" width="1122" height="1402" alt="{{ block.settings.title | escape }} — {{ 'edna.collection.concept_image' | t }}"><div class="edna-style-detail-copy"><p class="edna-eyebrow">{{ block.settings.subtitle | escape }}</p><h2 id="EdnaStyleTitle">{{ block.settings.title | escape }}</h2><p class="edna-style-detail-price">{{ block.settings.price | times: 100 | money_with_currency }} <small>{{ 'edna.collection.proposed_price' | t }}</small></p><p>{{ block.settings.description | escape }}</p><p class="edna-eyebrow">{{ 'edna.collection.size_study' | t }}</p><div class="edna-size-study"><span>36</span><span>37</span><span>38</span><span>39</span><span>40</span><span>41</span></div><p class="edna-style-disclosure">{{ 'edna.collection.product_note' | t }}</p><button type="button" class="edna-button" data-edna-save data-product-url="{{ routes.root_url }}#edna-{{ block.settings.slug }}" data-product-title="{{ block.settings.title | escape }}" aria-label="{{ 'edna.wishlist.save' | t: title: block.settings.title | escape }}" aria-pressed="false" hidden>{{ 'edna.wishlist.title' | t }}{% render 'edna-icon', name: 'heart' %}</button></div></div></template>
      </article>
    {% endfor %}
  </div>
  <p class="edna-editor-note" data-edna-no-results hidden>{{ 'edna.collection.no_results' | t }}</p>
  <div class="edna-catalog-more"><button type="button" class="edna-link" data-edna-show-all data-all-label="{{ 'edna.collection.view_all' | t }}" data-less-label="{{ 'edna.collection.view_edit' | t }}" hidden>{{ 'edna.collection.view_all' | t }}{% render 'edna-icon', name: 'arrow' %}</button></div>
</section>
<dialog class="edna edna-style-dialog" data-edna-style-dialog aria-labelledby="EdnaStyleTitle"><button type="button" class="edna-icon-button edna-style-dialog-close" data-edna-close-product aria-label="{{ 'edna.general.close' | t }}">{% render 'edna-icon', name: 'close' %}</button><div data-edna-style-content></div></dialog>
''',[setting('text','eyebrow','Eyebrow','CONSIDERED. SELECTED. EDNA.'),setting('text','heading','Heading','The EDNA Edit'),setting('textarea','introduction','Introduction','Twelve design directions. A few favourites to begin with.'),setting('range','initial_count','Initial product count',6,min=4,max=12,step=1)],[{'type':'style','name':'Footwear concept','settings':[setting('text','slug','Style identifier'),setting('text','title','Name'),setting('text','subtitle','Style'),setting('text','image_asset','Theme image filename'),setting('number','price','Proposed PKR price'),setting('text','category','Style category'),setting('text','occasions','Occasion filters'),setting('text','edit','Editorial filter'),setting('textarea','description','Design story')]}],12))

    write('sections/edna-concept-signature.liquid',section('EDNA signature concept',r'''
<section class="edna edna-new-signature"><div class="edna-new-signature-image"><img src="{{ 'edna-orbit.jpg' | asset_url }}" width="1122" height="1402" alt="{{ 'edna.collection.signature_alt' | t }}" loading="lazy"></div><div class="edna-new-signature-copy"><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape | newline_to_br }}</h2><p>{{ section.settings.description | escape }}</p><a href="#edna-orbit" class="edna-link" data-edna-open-style="orbit">{{ 'edna.collection.discover_orbit' | t }}{% render 'edna-icon', name: 'arrow' %}</a><span class="edna-signature-number">EDNA / 011</span></div></section>
''',[setting('text','eyebrow','Eyebrow','A DIFFERENT POINT OF VIEW'),setting('textarea','heading','Heading','Out of\nthe ordinary.'),setting('textarea','description','Story','Meet Orbit. Reflective silver, fluid lines and a sculptural oval heel. A design that treats the unexpected as an everyday possibility.')]))

    write('sections/edna-concept-stories.liquid',section('EDNA editorial stories',r'''
<section class="edna edna-section edna-new-stories" id="edna-stories"><div class="edna-section-heading"><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2></div><p>{{ section.settings.introduction | escape }}</p></div><div class="edna-story-grid">
  {% for block in section.blocks %}<article class="edna-story edna-story-{{ block.settings.tone }}" {{ block.shopify_attributes }}><div class="edna-story-media"><img src="{{ block.settings.image_asset | asset_url }}" width="1122" height="1402" alt="{{ block.settings.title | escape }} — {{ 'edna.collection.concept_image' | t }}" loading="lazy"></div><div class="edna-story-caption"><span class="edna-eyebrow">0{{ forloop.index }} / EDNA</span><h3>{{ block.settings.title | escape }}</h3><p>{{ block.settings.description | escape }}</p><a href="#edna-edit" class="edna-link" data-edna-collection-filter="{{ block.settings.filter | escape }}">{{ 'edna.stories.explore' | t }}{% render 'edna-icon', name: 'arrow' %}</a></div></article>{% endfor %}
</div></section>
''',[setting('text','eyebrow','Eyebrow','ONE HOUSE. EVERY SIDE OF YOU.'),setting('text','heading','Heading','A little restraint.\nA little rebellion.'),setting('textarea','introduction','Introduction','From modern occasionwear to a different kind of street style.')],[{'type':'story','name':'Editorial story','settings':[setting('text','title','Title'),setting('textarea','description','Story'),setting('text','image_asset','Theme image filename'),setting('text','filter','Collection filter'),setting('select','tone','Tone','light',options=[{'value':'light','label':'Ivory'},{'value':'dark','label':'Olive'}])]}],2))

    write('sections/edna-house-note.liquid',section('EDNA house signature',r'''
<section class="edna edna-house-note"><img class="edna-house-pattern" src="{{ 'edna-pattern-ivory.svg' | asset_url }}" width="1600" height="1600" loading="lazy" alt=""><div><p class="edna-eyebrow">{{ section.settings.eyebrow | escape }}</p><h2>{{ section.settings.heading | escape }}</h2><p>{{ section.settings.description | escape }}</p><a href="#edna-newsletter" class="edna-link">{{ 'edna.collection.follow_story' | t }}{% render 'edna-icon', name: 'arrow' %}</a></div><img class="edna-house-emblem" src="{{ 'edna-favicon.svg' | asset_url }}" width="180" height="180" loading="lazy" alt="{{ 'edna.collection.monogram_alt' | t }}"></section>
''',[setting('text','eyebrow','Eyebrow','THE EDNA POINT OF VIEW'),setting('text','heading','Heading','Form. Feeling. Footwear.'),setting('textarea','description','Story','A considered silhouette. An unexpected detail. A way of dressing that leaves room for every side of you. This is the first EDNA collection study.')]))

    categories=[('stilettos','Stilettos','noor'),('occasion','Occasion','mehfil'),('traditional','Tradition','gul'),('flats','Flats & Mules','forma'),('street','Street & Sneakers','cypher'),('statement','Statement','orbit')]
    sections={
        'campaign':{'type':'edna-concept-campaign','settings':{}},
        'styles':{'type':'edna-concept-shortcuts','settings':{},'blocks':{},'block_order':[]},
        'edit':{'type':'edna-concept-catalog','settings':{'initial_count':6},'blocks':{},'block_order':[]},
        'signature':{'type':'edna-concept-signature','settings':{}},
        'stories':{'type':'edna-concept-stories','settings':{},'blocks':{'quiet':{'type':'story','settings':{'title':'The Quiet Edit','description':'Soft lines. Modern occasionwear. A quietly confident entrance.','image_asset':'edna-mobile-campaign.jpg','filter':'quiet','tone':'light'}},'unexpected':{'type':'story','settings':{'title':'The Unexpected Edit','description':'Street silhouettes. Unexpected pairings. Follow your own instinct.','image_asset':'edna-street-editorial.jpg','filter':'unexpected','tone':'dark'}}},'block_order':['quiet','unexpected']},
        'occasions':{'type':'edna-concept-shortcuts','settings':{'eyebrow':'WHERE WILL YOU TAKE THEM?','heading':'Dress for the moment.','introduction':'Start with the occasion. Find your own way there.','occasion':True},'blocks':{},'block_order':[]},
        'house':{'type':'edna-house-note','settings':{}}
    }
    for key,title,slug in categories:
        sections['styles']['blocks'][key]={'type':'shortcut','settings':{'title':title,'filter':key,'image_asset':'edna-'+slug+'.jpg'}}
        sections['styles']['block_order'].append(key)
    first=['noor','gul','cypher','mehfil','forma','orbit']
    ordered=sorted(products,key=lambda p:first.index(p['slug']) if p['slug'] in first else 6+products.index(p))
    for p in ordered:
        sections['edit']['blocks'][p['slug']]={'type':'style','settings':{'slug':p['slug'],'title':p['name'],'subtitle':p['type'],'image_asset':p['image_asset'],'price':p['proposed_price_pkr'],'category':p['category'],'occasions':' '.join(p['occasions']),'edit':'unexpected' if p['category'] in ['street','statement'] else 'quiet','description':p['description']}}
        sections['edit']['block_order'].append(p['slug'])
    for key,title,slug in [('wedding','Wedding Guest','sitara'),('everyday','Everyday','lina'),('after-dark','After Dark','fable'),('weekend','Weekend','cypher')]:
        sections['occasions']['blocks'][key]={'type':'shortcut','settings':{'title':title,'filter':key,'image_asset':'edna-'+slug+'.jpg'}}
        sections['occasions']['block_order'].append(key)
    write('templates/index.json',json.dumps({'sections':sections,'order':list(sections)},indent=2))

    locales=read_json('locales/en.default.json')
    locales['edna']['collection']={
        'campaign_alt':'AI-generated EDNA campaign concept with a Pakistani model wearing ivory stilettos',
        'explore':'Explore the collection','chapter':'THE FIRST CHAPTER','notice':'Collection study — AI-generated design imagery and proposed prices. Styles are not available to order.','no_results':'No styles match that search. Try a name, a silhouette or a different mood.',
        'concept_image':'AI-generated design concept','view_style':'Explore {{ title }}','all_styles':'All styles','view_all':'Explore all 12 styles','view_edit':'Back to the edit','count':'styles in this selection','proposed_price':'Proposed price','size_study':'PROPOSED EU SIZE RANGE',
        'product_note':'Design concept with an AI-generated image. Final materials, fit, sizing and availability are to be confirmed. Not available to order.',
        'signature_alt':'AI-generated EDNA Orbit concept with a silver oval sculptural heel','discover_orbit':'Discover Orbit','follow_story':'Follow the EDNA story','monogram_alt':'EDNA architectural monogram','house':'The house'
    }
    write('locales/en.default.json',json.dumps(locales,ensure_ascii=False,indent=2))

    header=(THEME/'sections/edna-header.liquid').read_text(encoding='utf-8')
    old='<img src="{{ \'edna-wordmark.svg\' | asset_url }}" width="150" height="54" alt="EDNA Footwear">'
    new='<picture><source media="(max-width: 749px)" srcset="{{ \'edna-mobile-logo.svg\' | asset_url }}"><img src="{{ \'edna-header-logo.svg\' | asset_url }}" width="200" height="46" alt="EDNA Footwear"></picture>'
    header=header.replace(old,new)
    header=header.replace('{{ routes.all_products_collection_url }}','{{ routes.root_url }}#edna-edit')
    write('sections/edna-header.liquid',header)
    footer=(THEME/'sections/edna-footer.liquid').read_text(encoding='utf-8').replace("'edna-wordmark.svg'","'edna-footer-logo.svg'")
    write('sections/edna-footer.liquid',footer)
    layout=(THEME/'layout/theme.liquid').read_text(encoding='utf-8')
    if "'edna-collection.css'" not in layout:
        layout=layout.replace("{{ 'edna.css' | asset_url | stylesheet_tag }}","{{ 'edna.css' | asset_url | stylesheet_tag }}\n    {{ 'edna-collection.css' | asset_url | stylesheet_tag }}\n    <script src=\"{{ 'edna-collection.js' | asset_url }}\" defer></script>")
        layout=layout.replace('<head>', '<head>\n    <link rel="icon" type="image/png" href="{{ \'edna-favicon-32.png\' | asset_url }}">\n    <link rel="apple-touch-icon" href="{{ \'edna-apple-touch.png\' | asset_url }}">')
    write('layout/theme.liquid',layout)
    meta=(THEME/'snippets/meta-tags.liquid').read_text(encoding='utf-8')
    if 'edna-share-preview' not in meta:
        meta=meta.replace('{%- endif -%}\n\n{%- if request.page_type == \'product\' -%}', '{%- else -%}\n  <meta property="og:image" content="https:{{ \'edna-share-preview.png\' | asset_url }}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n{%- endif -%}\n\n{%- if request.page_type == \'product\' -%}')
    if 'edna_page_title' not in meta:
        meta=meta.replace("assign og_title = page_title | default: shop.name", "assign og_title = page_title | default: 'EDNA'\n  assign edna_page_title = page_title")
        meta=meta.replace("  if request.page_type == 'product'", "  if request.page_type == 'index'\n    assign og_title = 'EDNA — Footwear house'\n    assign edna_page_title = og_title\n    assign og_description = 'Sculpted for modern life. Discover the EDNA collection study, from quiet silhouettes to unexpected statement footwear.'\n  endif\n\n  if request.page_type == 'product'",1)
        meta=meta.replace('content="{{ shop.name }}"','content="EDNA"').replace('{{ page_title }}','{{ edna_page_title }}').replace("unless page_title contains shop.name %} &ndash; {{ shop.name }}", "unless edna_page_title contains 'EDNA' %} &ndash; EDNA")
    write('snippets/meta-tags.liquid',meta)
    changed.extend(['assets/edna-collection.css','assets/edna-collection.js'])
    (ROOT/'.agent/collection-changed-files.json').write_text(json.dumps(list(dict.fromkeys(changed)),indent=2))
    print(json.dumps({'changed':len(set(changed)),'concepts':len(products)}))

if __name__=='__main__': main()
