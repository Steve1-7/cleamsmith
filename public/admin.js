(function () {
  'use strict';

  var config = window.CLEANSMITH_SUPABASE_CONFIG || {};
  var loginPanel = document.getElementById('loginPanel');
  var dashboard = document.getElementById('dashboard');
  var loginStatus = document.getElementById('loginStatus');
  var dashboardStatus = document.getElementById('dashboardStatus');
  var client;
  var plans = [];

  function message(node, text, error) {
    node.textContent = text || '';
    node.classList.toggle('error', Boolean(error));
  }

  function configured() {
    return config.url && config.anonKey &&
      config.url.indexOf('YOUR_PROJECT_ID') === -1 &&
      config.anonKey.indexOf('YOUR_SUPABASE_') === -1 &&
      window.supabase && window.supabase.createClient;
  }

  function call(result) {
    return result.then(function (response) {
      if (response.error) throw response.error;
      return response.data;
    });
  }

  function rows(table, column) {
    return call(client.from(table).select('*').order(column, { ascending: true }));
  }

  function formValues(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function nullableId(value) {
    return value || null;
  }

  function lines(value) {
    return String(value || '').split(/\r?\n/).map(function (line) {
      return line.trim();
    }).filter(Boolean);
  }

  function number(value) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error('Enter a valid number.');
    return parsed;
  }

  function save(table, id, values) {
    var query = id
      ? client.from(table).update(values).eq('id', id)
      : client.from(table).insert(values);
    return call(query.select().single());
  }

  function remove(table, id) {
    return call(client.from(table).delete().eq('id', id));
  }

  function make(tag, text, className) {
    var node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function actionButton(label, callback, danger) {
    var button = make('button', label, 'btn ' + (danger ? 'danger' : 'secondary'));
    button.type = 'button';
    button.addEventListener('click', callback);
    return button;
  }

  function card(list, title, detail, edit, del, media) {
    var item = make('article', undefined, 'item');
    if (media) item.appendChild(media);
    var main = make('div', undefined, 'item-main');
    main.appendChild(make('div', title, 'item-title'));
    main.appendChild(make('small', detail || '', 'muted'));
    item.appendChild(main);
    var actions = make('div', undefined, 'item-actions');
    actions.appendChild(actionButton('Edit', edit, false));
    actions.appendChild(actionButton('Delete', del, true));
    item.appendChild(actions);
    list.appendChild(item);
  }

  function resetForm(form) {
    form.reset();
    form.elements.id.value = '';
  }

  function editForm(form, record, transforms) {
    Object.keys(record).forEach(function (key) {
      var control = form.elements.namedItem(key);
      if (!control) return;
      var value = record[key];
      if (transforms && transforms[key]) value = transforms[key](value);
      control.value = value == null ? '' : value;
    });
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPackages(data) {
    var list = document.getElementById('packageList');
    list.replaceChildren();
    data.forEach(function (pkg) {
      card(list, pkg.name + ' — R' + Number(pkg.starting_price).toLocaleString('en-ZA'),
        (pkg.is_active ? 'Visible' : 'Hidden') + ' · ' + pkg.slug,
        function () {
          var form = document.getElementById('packageForm');
          editForm(form, pkg, {
            features: function (items) { return (items || []).join('\n'); },
            is_active: String,
            sort_order: String
          });
          ['hatch', 'sedan', 'suv', 'luxury', 'minibus'].forEach(function (vehicle) {
            form.elements['price_' + vehicle].value = pkg.vehicle_prices && pkg.vehicle_prices[vehicle] != null
              ? pkg.vehicle_prices[vehicle]
              : '';
          });
        },
        function () {
          if (!window.confirm('Delete this package?')) return;
          remove('packages', pkg.id).then(refresh).then(function () {
            message(dashboardStatus, 'Package deleted.');
          }).catch(showError);
        });
    });
  }

  function renderPlans(data) {
    plans = data;
    var list = document.getElementById('planList');
    var select = document.getElementById('memberPlan');
    list.replaceChildren();
    select.replaceChildren(new Option('No plan', ''));
    data.forEach(function (plan) {
      select.add(new Option(plan.name, plan.id));
      card(list, plan.name + ' — R' + Number(plan.price).toLocaleString('en-ZA') + ' / ' + plan.billing_interval,
        (plan.is_active ? 'Visible' : 'Hidden') + ' · ' + (plan.benefits || []).length + ' benefits',
        function () {
          editForm(document.getElementById('planForm'), plan, {
            benefits: function (items) { return (items || []).join('\n'); },
            is_active: String,
            sort_order: String
          });
        },
        function () {
          if (!window.confirm('Delete this membership plan? Member records will be kept without a plan.')) return;
          remove('membership_plans', plan.id).then(refresh).then(function () {
            message(dashboardStatus, 'Membership plan deleted.');
          }).catch(showError);
        });
    });
    var memberSelect = document.getElementById('memberForm').elements.plan_id;
    var selected = memberSelect.value;
    memberSelect.replaceChildren(new Option('No plan', ''));
    data.forEach(function (plan) { memberSelect.add(new Option(plan.name, plan.id)); });
    memberSelect.value = selected;
  }

  function renderMembers(data) {
    var list = document.getElementById('memberList');
    list.replaceChildren();
    data.forEach(function (member) {
      var plan = plans.find(function (item) { return item.id === member.plan_id; });
      card(list, member.full_name, [member.email, member.phone, plan ? plan.name : 'No plan', member.status].filter(Boolean).join(' · '),
        function () {
          editForm(document.getElementById('memberForm'), member, {
            joined_at: function (date) { return date ? String(date).slice(0, 10) : ''; }
          });
        },
        function () {
          if (!window.confirm('Delete this member record?')) return;
          remove('members', member.id).then(refresh).then(function () {
            message(dashboardStatus, 'Member record deleted.');
          }).catch(showError);
        });
    });
  }

  function renderGallery(data) {
    var list = document.getElementById('galleryList');
    list.replaceChildren();
    data.forEach(function (work) {
      var preview = work.media_type === 'video' ? make('video') : make('img');
      preview.src = work.media_url;
      if (work.media_type === 'video') {
        preview.muted = true;
        preview.playsInline = true;
      } else {
        preview.alt = work.alt_text || work.title;
      }
      card(list, work.title, (work.is_published ? 'Published' : 'Hidden') + ' · ' + work.media_type,
        function () { editForm(document.getElementById('galleryForm'), work, { is_published: String, sort_order: String }); },
        function () {
          if (!window.confirm('Delete this gallery item?')) return;
          remove('work_gallery', work.id).then(function () {
            if (work.storage_path) {
              return call(client.storage.from('cleansmith-work').remove([work.storage_path]));
            }
          }).then(refresh).then(function () {
            message(dashboardStatus, 'Gallery item deleted.');
          }).catch(showError);
        }, preview);
    });
  }

  function refresh() {
    return Promise.all([
      rows('packages', 'sort_order'),
      rows('membership_plans', 'sort_order'),
      rows('members', 'full_name'),
      rows('work_gallery', 'sort_order')
    ]).then(function (data) {
      renderPackages(data[0]);
      renderPlans(data[1]);
      renderMembers(data[2]);
      renderGallery(data[3]);
    });
  }

  function showError(error) {
    console.error('CLEANSMITH admin operation failed:', error);
    message(dashboardStatus, error && error.message ? error.message : 'The request failed. Please try again.', true);
  }

  function connectForm(formId, table, prepare, afterSave) {
    var form = document.getElementById(formId);
    form.addEventListener('reset', function () {
      window.setTimeout(function () { form.elements.id.value = ''; }, 0);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      message(dashboardStatus, 'Saving…');
      try {
        var raw = formValues(form);
        var id = raw.id;
        delete raw.id;
        var prepared;
        var persisted = false;
        Promise.resolve(prepare(raw, form)).then(function (values) {
          prepared = values;
          return save(table, id, values);
        }).then(function (record) {
          persisted = true;
          if (afterSave) return afterSave(record, raw, prepared);
        }).then(function () {
          resetForm(form);
          return refresh();
        }).then(function () {
          message(dashboardStatus, 'Saved successfully.');
        }).catch(function (error) {
          if (!persisted && prepared && prepared.storage_path && prepared.storage_path !== raw.storage_path) {
            call(client.storage.from('cleansmith-work').remove([prepared.storage_path]))
              .then(function () { showError(error); })
              .catch(function (cleanupError) {
                console.error('Unable to clean up the failed gallery upload:', cleanupError);
                showError(new Error((error.message || 'The save failed.') + ' The uploaded file could not be removed.'));
              });
            return;
          }
          showError(error);
        });
      } catch (error) {
        showError(error);
      }
    });
  }

  function publicUrl(path) {
    return client.storage.from('cleansmith-work').getPublicUrl(path).data.publicUrl;
  }

  function uploadWork(form, values) {
    var file = form.elements.media_file.files[0];
    var upload;
    if (file) {
      if (file.size > 104857600) throw new Error('Files must be 100 MB or smaller.');
      var type = file.type.indexOf('video/') === 0 ? 'video' : file.type.indexOf('image/') === 0 ? 'image' : '';
      if (!type) throw new Error('Choose a supported image or video file.');
      var path = Date.now() + '-' + Math.random().toString(36).slice(2) + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      upload = call(client.storage.from('cleansmith-work').upload(path, file, { upsert: false })).then(function () {
        values.storage_path = path;
        values.media_url = publicUrl(path);
        values.media_type = type;
      });
    } else {
      if (!values.media_url) throw new Error('Select an image or video file to upload.');
      upload = Promise.resolve();
    }
    delete values.media_file;
    return upload.then(function () {
      delete values.id;
      return values;
    });
  }

  function setupDashboard() {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (item) {
          item.classList.toggle('active', item === tab);
        });
        document.querySelectorAll('[data-section]').forEach(function (section) {
          section.hidden = section.dataset.section !== tab.dataset.tab;
        });
        message(dashboardStatus, '');
      });
    });

    connectForm('packageForm', 'packages', function (values) {
      values.starting_price = number(values.starting_price);
      values.sort_order = number(values.sort_order);
      values.features = lines(values.features);
      values.vehicle_prices = {
        hatch: number(values.price_hatch),
        sedan: number(values.price_sedan),
        suv: number(values.price_suv),
        luxury: number(values.price_luxury),
        minibus: number(values.price_minibus)
      };
      delete values.price_hatch;
      delete values.price_sedan;
      delete values.price_suv;
      delete values.price_luxury;
      delete values.price_minibus;
      values.is_active = values.is_active === 'true';
      return values;
    });
    connectForm('planForm', 'membership_plans', function (values) {
      values.price = number(values.price);
      values.discount_percent = number(values.discount_percent);
      values.sort_order = number(values.sort_order);
      values.benefits = lines(values.benefits);
      values.is_active = values.is_active === 'true';
      return values;
    });
    connectForm('memberForm', 'members', function (values) {
      values.plan_id = nullableId(values.plan_id);
      values.joined_at = values.joined_at || undefined;
      return values;
    });
    connectForm('galleryForm', 'work_gallery', function (values, form) {
      values.sort_order = number(values.sort_order);
      values.is_published = values.is_published === 'true';
      return uploadWork(form, values);
    }, function (record, previous, saved) {
      var oldPath = previous.storage_path;
      if (oldPath && oldPath !== saved.storage_path) {
        return call(client.storage.from('cleansmith-work').remove([oldPath]));
      }
    });

    document.getElementById('signOut').addEventListener('click', function () {
      client.auth.signOut().then(function (response) {
        if (response.error) throw response.error;
        dashboard.hidden = true;
        loginPanel.hidden = false;
        message(loginStatus, 'You have signed out.');
      }).catch(function (error) {
        console.error('Unable to sign out:', error);
        message(dashboardStatus, error.message || 'Unable to sign out.', true);
      });
    });
  }

  function enterDashboard(session) {
    return call(client.rpc('is_cleansmith_admin')).then(function (isAdmin) {
      if (!isAdmin) {
        return client.auth.signOut().then(function () {
          throw new Error('This account does not have the admin role. Ask the project owner to grant app_metadata.role = admin.');
        });
      }
      document.getElementById('userEmail').textContent = session.user.email || '';
      loginPanel.hidden = true;
      dashboard.hidden = false;
      return refresh();
    });
  }

  if (!configured()) {
    message(loginStatus, 'Configure the Supabase project URL and anon key in supabase-config.js to enable admin sign-in.', true);
    document.getElementById('loginForm').querySelectorAll('input,button').forEach(function (control) {
      control.disabled = true;
    });
    return;
  }

  client = window.supabase.createClient(config.url, config.anonKey);
  setupDashboard();
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    message(loginStatus, 'Signing in…');
    var values = formValues(event.currentTarget);
    client.auth.signInWithPassword({ email: values.email, password: values.password })
      .then(function (result) {
        if (result.error) throw result.error;
        return enterDashboard(result.data.session);
      }).catch(function (error) {
        console.error('CLEANSMITH sign-in failed:', error);
        message(loginStatus, error.message || 'Unable to sign in.', true);
      });
  });
  client.auth.getSession().then(function (result) {
    if (result.error) throw result.error;
    if (result.data.session) return enterDashboard(result.data.session);
  }).catch(function (error) {
    console.error('Unable to restore CLEANSMITH admin session:', error);
    message(loginStatus, error.message || 'Unable to restore the admin session.', true);
  });
})();
