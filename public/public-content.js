(function () {
  'use strict';

  var config = window.CLEANSMITH_SUPABASE_CONFIG || {};
  var validConfig = config.url && config.anonKey &&
    config.url.indexOf('YOUR_PROJECT_ID') === -1 &&
    config.anonKey.indexOf('YOUR_SUPABASE_') === -1;
  if (!validConfig || !window.supabase || !window.supabase.createClient) return;

  var client = window.supabase.createClient(config.url, config.anonKey);
  var formatter = new Intl.NumberFormat('en-ZA');

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function readRows(table, column) {
    return client.from(table).select('*').order(column, { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || [];
      });
  }

  function renderPackages(rows) {
    var grid = document.querySelector('.packages-grid');
    var wizardGrid = document.querySelector('#stepsInner .step[data-step="1"] > div:nth-child(2)');
    if (!grid || !wizardGrid) return;

    grid.replaceChildren();
    wizardGrid.replaceChildren();
    if (!rows.length) {
      grid.appendChild(element('p', 'section-sub', 'Our packages are being updated. Please contact us for current pricing.'));
      return;
    }
    window.CLEANSMITH_PACKAGE_NAMES = {};
    var prices = window.CLEANSMITH_PRICES;

    rows.forEach(function (pkg) {
      var slug = String(pkg.slug || '');
      window.CLEANSMITH_PACKAGE_NAMES[slug] = pkg.name;
      if (prices && pkg.vehicle_prices) prices[slug] = pkg.vehicle_prices;

      var card = element('article', 'pkg-card fade-up' + (pkg.style === 'featured' ? ' featured' : '') + (pkg.style === 'executive' ? ' executive' : ''));
      card.dataset.package = slug;
      if (pkg.badge) {
        var badge = element('div', 'pkg-badge' + (pkg.style === 'executive' ? ' top-gold' : ''), pkg.badge);
        card.appendChild(badge);
      }
      card.appendChild(element('h3', 'pkg-name', pkg.name));
      var price = element('div', 'pkg-price' + (pkg.style === 'executive' ? ' executive' : ''));
      price.appendChild(document.createTextNode('R' + formatter.format(pkg.starting_price)));
      price.appendChild(element('span', '', ' / ' + (pkg.price_unit || 'session')));
      card.appendChild(price);
      if (pkg.duration) card.appendChild(element('div', 'pkg-time', '⏱ ' + pkg.duration));
      card.appendChild(element('div', 'pkg-divider'));
      if (pkg.description) card.appendChild(element('p', 'pkg-description', pkg.description));
      var list = element('ul', 'pkg-features');
      (pkg.features || []).forEach(function (feature) {
        list.appendChild(element('li', '', '✓ ' + feature));
      });
      card.appendChild(list);
      var action = element('div', 'select-package');
      var button = element('button', 'select-toggle' + (pkg.style === 'executive' ? ' executive' : ''), 'Select Package');
      button.type = 'button';
      button.dataset.pkg = slug;
      action.appendChild(button);
      card.appendChild(action);
      grid.appendChild(card);

      var wizardCard = element('button', 'pkg-select-card' + (pkg.style === 'featured' ? ' featured' : '') + (pkg.style === 'executive' ? ' executive' : ''));
      wizardCard.type = 'button';
      wizardCard.dataset.pkg = slug;
      wizardCard.style.flex = '1';
      wizardCard.style.padding = '12px';
      wizardCard.appendChild(document.createTextNode(pkg.name + ' '));
      wizardCard.appendChild(element('strong', '', 'R' + formatter.format(pkg.starting_price)));
      wizardGrid.appendChild(wizardCard);
    });
  }

  function renderMemberships(rows) {
    var grid = document.querySelector('#vip .section-inner > div:last-child');
    if (!grid) return;
    grid.replaceChildren();
    if (!rows.length) {
      grid.appendChild(element('p', 'section-sub', 'Contact us to learn about current membership options.'));
      return;
    }
    rows.forEach(function (plan, index) {
      var card = element('article', 'pkg-card' + (index ? ' executive' : ''));
      card.style.padding = '22px';
      var badge = element('div', 'pkg-badge' + (index ? ' top-gold' : ''), plan.badge || plan.name);
      card.appendChild(badge);
      card.appendChild(element('h3', 'pkg-name', plan.name + ' — R' + formatter.format(plan.price) + ' / ' + plan.billing_interval));
      var benefits = element('ul', '');
      benefits.style.marginTop = '12px';
      var planBenefits = (plan.benefits || []).filter(function (benefit) {
        return !/\d+\s*%\s*off/i.test(benefit);
      });
      if (plan.discount_percent > 0) planBenefits.push(plan.discount_percent + '% off add-ons');
      planBenefits.forEach(function (benefit) {
        benefits.appendChild(element('li', '', benefit));
      });
      card.appendChild(benefits);
      var join = element('a', 'btn-primary', 'Join via WhatsApp');
      join.href = 'https://wa.me/27717856901?text=' + encodeURIComponent('I want to join CLEANSMITH VIP ' + plan.name);
      join.style.marginTop = '12px';
      join.style.display = 'inline-block';
      if (index) {
        join.style.background = 'linear-gradient(90deg,var(--gold),#e6cf9f)';
        join.style.color = 'var(--navy)';
      }
      card.appendChild(join);
      var note = element('div', '');
      note.style.cssText = 'font-size:0.8rem;color:var(--white-text);margin-top:8px';
      note.textContent = 'No contracts. Cancel anytime.';
      card.appendChild(note);
      grid.appendChild(card);
    });
  }

  function renderGallery(rows) {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    grid.replaceChildren();
    if (!rows.length) {
      grid.appendChild(element('p', 'section-sub', 'New work will be featured here soon.'));
      return;
    }
    rows.forEach(function (work) {
      var item = element('div', 'gallery-item fade-up visible');
      var link = element('a', 'gallery-link');
      link.href = work.media_url;
      link.dataset.lightbox = 'gallery';
      link.title = work.title || '';
      var inner = element('div', 'gallery-item-inner');
      if (work.media_type === 'video') {
        var video = element('video', '');
        video.loading = 'lazy';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        var source = element('source');
        source.src = work.media_url;
        video.appendChild(source);
        inner.appendChild(video);
      } else {
        var image = element('img', '');
        image.loading = 'lazy';
        image.src = work.media_url;
        image.alt = work.alt_text || work.title || 'CLEANSMITH detailing work';
        inner.appendChild(image);
      }
      link.appendChild(inner);
      item.appendChild(link);
      if (work.caption) item.appendChild(element('p', 'gallery-caption', work.caption));
      grid.appendChild(item);
    });
  }

  document.addEventListener('click', function (event) {
    var target = event.target.closest('.select-toggle, .pkg-select-card');
    if (target) {
      var slug = target.dataset.pkg;
      if (!slug) return;
      window.preselectedPackage = slug;
      var packageInput = document.getElementById('wizardPackage');
      if (packageInput) packageInput.value = slug;
      document.querySelectorAll('.select-toggle, .pkg-select-card').forEach(function (button) {
        button.classList.toggle('active', button.dataset.pkg === slug);
      });
      if (typeof window.CLEANSMITH_UPDATE_WIZARD === 'function') window.CLEANSMITH_UPDATE_WIZARD();
      var booking = document.getElementById('booking');
      if (target.classList.contains('select-toggle') && booking) booking.scrollIntoView({ behavior: 'smooth' });
    }

    var link = event.target.closest('.gallery-link');
    if (!link || !document.querySelector('.gallery-grid') || !link.closest('.gallery-grid')) return;
    event.preventDefault();
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    var previous = lightbox.querySelector('.lb-media');
    if (previous) previous.remove();
    var media;
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(link.href)) {
      media = document.createElement('video');
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
      media.src = link.href;
    } else {
      media = document.createElement('img');
      media.src = link.href;
      media.alt = link.title || '';
    }
    media.className = 'lb-media';
    media.style.maxWidth = '92vw';
    media.style.maxHeight = '86vh';
    lightbox.appendChild(media);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  Promise.all([
    readRows('packages', 'sort_order'),
    readRows('membership_plans', 'sort_order'),
    readRows('work_gallery', 'sort_order')
  ]).then(function (results) {
    renderPackages(results[0]);
    renderMemberships(results[1]);
    renderGallery(results[2]);
  }).catch(function (error) {
    console.error('Unable to load CLEANSMITH public content from Supabase:', error);
  });
})();
