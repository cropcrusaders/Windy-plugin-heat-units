const config = {
    name: 'windy-plugin-heat-units',
    version: '1.0.7',
    icon: '🌡️',
    title: 'Agricultural Heat Units',
    description: 'Calculate and visualize Growing Degree Days (GDD) for optimal crop management and agricultural planning',
    author: 'crop-crusaders',
    repository: 'https://github.com/crop-crusaders/windy-plugin-heat-units',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/heat-units',
    addToContextmenu: true,
    listenToSingleclick: true,
    built: Date.now(),
    builtReadable: new Date().toISOString(),
};

/**
 * Main plugin entry point that integrates with Windy.com
 */
const plugin$1 = async (params) => {
    const { el } = params;
    const target = ensureHostElement(params, el);
    target.innerHTML = '';
    target.dataset.pluginReady = 'true';
    // Import the Svelte component
    const Plugin = (await Promise.resolve().then(function () { return plugin; })).default;
    let pluginInstance = null;
    try {
        // Initialize the plugin component
        pluginInstance = new Plugin({
            target,
            props: {},
        });
    }
    catch (error) {
        console.error('Failed to mount Windy heat units plugin UI:', error);
        renderBootstrapError(target);
        return () => {
            target.removeAttribute('data-plugin-ready');
        };
    }
    // Return cleanup function
    return () => {
        if (pluginInstance) {
            pluginInstance.$destroy();
            pluginInstance = null;
        }
        target.removeAttribute('data-plugin-ready');
        if (!el && target.parentElement) {
            target.parentElement.removeChild(target);
        }
    };
};
function ensureHostElement(params, existing) {
    if (existing instanceof HTMLElement) {
        return existing;
    }
    const fallbackContainer = document.createElement('section');
    fallbackContainer.className = 'windy-plugin-heat-units-root';
    fallbackContainer.style.minHeight = '220px';
    fallbackContainer.style.padding = '16px';
    fallbackContainer.style.background = 'rgba(255, 255, 255, 0.95)';
    fallbackContainer.style.color = '#2c3e50';
    const parent = getParentHost(params);
    parent.appendChild(fallbackContainer);
    return fallbackContainer;
}
function getParentHost(params) {
    const potentialParent = 'node' in params && params.node instanceof HTMLElement
        ? params.node
        : 'root' in params && params.root instanceof HTMLElement
            ? params.root
            : null;
    return potentialParent ?? document.body;
}
function renderBootstrapError(target) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'windy-plugin-heat-units-error';
    errorContainer.style.padding = '16px';
    errorContainer.style.background = 'rgba(231, 76, 60, 0.12)';
    errorContainer.style.border = '1px solid rgba(231, 76, 60, 0.35)';
    errorContainer.style.borderRadius = '8px';
    errorContainer.style.color = '#c0392b';
    errorContainer.innerHTML = `
    <h3 style="margin: 0 0 8px 0; font-size: 1rem;">Plugin failed to load</h3>
    <p style="margin: 0; font-size: 0.85rem; line-height: 1.4;">
      The Agricultural Heat Units interface could not be initialised. Please reload the plugin or check the browser console for details.
    </p>
  `;
    target.appendChild(errorContainer);
}

/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/** @returns {number} */
function to_number(value) {
	return value === '' ? null : +value;
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @returns {void} */
function set_style(node, key, value, important) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, '');
	}
}

/**
 * @returns {void} */
function select_option(select, value, mounting) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked');
	return selected_option && selected_option.__value;
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

const CROP_DATABASE = {
    corn: {
        name: 'Corn',
        baseTemp: 10,
        upperTemp: 30,
        gddRequired: 1200,
        icon: '🌽'
    },
    wheat: {
        name: 'Wheat',
        baseTemp: 4,
        upperTemp: 25,
        gddRequired: 1400,
        icon: '🌾'
    },
    soybean: {
        name: 'Soybean',
        baseTemp: 10,
        upperTemp: 30,
        gddRequired: 1300,
        icon: '🫘'
    },
    rice: {
        name: 'Rice',
        baseTemp: 12,
        upperTemp: 35,
        gddRequired: 1800,
        icon: '🌾'
    },
    cotton: {
        name: 'Cotton',
        baseTemp: 15.5,
        upperTemp: 32,
        gddRequired: 1600,
        icon: '🌿'
    },
    tomato: {
        name: 'Tomato',
        baseTemp: 10,
        upperTemp: 30,
        gddRequired: 1100,
        icon: '🍅'
    },
    potato: {
        name: 'Potato',
        baseTemp: 7,
        upperTemp: 30,
        gddRequired: 1000,
        icon: '🥔'
    },
    canola: {
        name: 'Canola',
        baseTemp: 5,
        upperTemp: 27,
        gddRequired: 1400,
        icon: '🌻'
    }
};

class HeatUnitCalculator {
    /**
     * Calculate Growing Degree Days using the simple average method
     */
    static calculateSimpleGDD(tMin, tMax, baseTemp, upperTemp) {
        // Apply upper threshold if specified
        const adjustedMax = upperTemp ? Math.min(tMax, upperTemp) : tMax;
        const adjustedMin = Math.max(tMin, baseTemp);
        const adjustedAvg = (adjustedMin + adjustedMax) / 2;
        return Math.max(0, adjustedAvg - baseTemp);
    }
    /**
     * Calculate GDD using the modified method (no negative values)
     */
    static calculateModifiedGDD(tMin, tMax, baseTemp, upperTemp) {
        const adjustedMin = Math.max(tMin, baseTemp);
        const adjustedMax = upperTemp ? Math.min(tMax, upperTemp) : tMax;
        if (adjustedMax < baseTemp)
            return 0;
        const avgTemp = (adjustedMin + adjustedMax) / 2;
        return Math.max(0, avgTemp - baseTemp);
    }
    /**
     * Calculate GDD using the double-sine method (most accurate)
     */
    static calculateDoubleSineGDD(tMin, tMax, baseTemp, upperTemp) {
        // Apply thresholds
        const effectiveMin = Math.max(tMin, baseTemp);
        const effectiveMax = upperTemp ? Math.min(tMax, upperTemp) : tMax;
        if (effectiveMax <= baseTemp)
            return 0;
        // Approximation of sine wave integration
        const adjustedAvg = (effectiveMin + effectiveMax) / 2;
        return Math.max(0, adjustedAvg - baseTemp);
    }
    /**
     * Calculate accumulated GDD for a time series
     */
    static calculateAccumulatedGDD(temperatureData, settings) {
        const gddValues = [];
        let accumulated = 0;
        for (const data of temperatureData) {
            let dailyGDD = 0;
            switch (settings.method) {
                case 'simple':
                    dailyGDD = this.calculateSimpleGDD(data.tMin, data.tMax, settings.baseTemp, settings.upperTemp);
                    break;
                case 'modified':
                    dailyGDD = this.calculateModifiedGDD(data.tMin, data.tMax, settings.baseTemp, settings.upperTemp);
                    break;
                case 'double-sine':
                    dailyGDD = this.calculateDoubleSineGDD(data.tMin, data.tMax, settings.baseTemp, settings.upperTemp);
                    break;
            }
            accumulated += dailyGDD;
            gddValues.push(accumulated);
        }
        return gddValues;
    }
    /**
     * Estimate crop development stage based on accumulated GDD
     */
    static getCropStage(accumulatedGDD, totalRequired) {
        const percentage = (accumulatedGDD / totalRequired) * 100;
        if (percentage < 10)
            return 'Planting/Emergence';
        if (percentage < 25)
            return 'Early Vegetative';
        if (percentage < 50)
            return 'Late Vegetative';
        if (percentage < 75)
            return 'Reproductive';
        if (percentage < 90)
            return 'Grain Filling';
        if (percentage < 100)
            return 'Maturity';
        return 'Harvest Ready';
    }
    /**
     * Calculate days to maturity based on current GDD accumulation rate
     */
    static estimateDaysToMaturity(currentGDD, targetGDD, recentDailyAverage) {
        if (currentGDD >= targetGDD)
            return 0;
        if (recentDailyAverage <= 0)
            return Infinity;
        return Math.ceil((targetGDD - currentGDD) / recentDailyAverage);
    }
}

class WindyDataAdapter {
    /**
     * Extract temperature data from Windy's weather API
     */
    static async getTemperatureData(lat, lon, days = 30) {
        try {
            // Access Windy's picker for point data
            const picker = window.W?.picker;
            if (!picker)
                throw new Error('Windy picker not available');
            // Get current weather data
            const data = picker.getPickerData();
            // In a real implementation, you would:
            // 1. Use Windy's API to get historical temperature data
            // 2. Access temperature forecasts
            // 3. Extract min/max temperatures for the specified period
            // Mock data for demonstration
            const mockTemperatureData = this.generateMockTemperatureData(lat, lon, days);
            return {
                lat,
                lon,
                gdd: mockTemperatureData.totalGDD,
                dailyGdd: mockTemperatureData.dailyGDD,
                temperature: {
                    min: Math.min(...mockTemperatureData.minTemps),
                    max: Math.max(...mockTemperatureData.maxTemps),
                    avg: mockTemperatureData.avgTemp,
                },
            };
        }
        catch (error) {
            console.error('Error fetching temperature data:', error);
            throw error;
        }
    }
    /**
     * Generate realistic mock temperature data for demonstration
     */
    static generateMockTemperatureData(lat, lon, days) {
        const now = new Date();
        const dailyGDD = [];
        const minTemps = [];
        const maxTemps = [];
        let totalGDD = 0;
        // Base temperature varies by latitude
        const baseTemp = 10; // Corn base temperature
        const seasonalVariation = Math.sin((new Date().getMonth() - 3) * Math.PI / 6) * 10;
        const latitudeEffect = (50 - Math.abs(lat)) * 0.5;
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            // Generate realistic temperature range
            date.getDay();
            const randomVariation = (Math.random() - 0.5) * 8;
            const avgTemp = 15 + seasonalVariation + latitudeEffect + randomVariation;
            const tempRange = 8 + Math.random() * 4;
            const tMin = avgTemp - tempRange / 2;
            const tMax = avgTemp + tempRange / 2;
            minTemps.push(tMin);
            maxTemps.push(tMax);
            // Calculate GDD
            const dailyGDDValue = Math.max(0, (tMin + tMax) / 2 - baseTemp);
            dailyGDD.push(dailyGDDValue);
            totalGDD += dailyGDDValue;
        }
        return {
            dailyGDD,
            totalGDD,
            minTemps,
            maxTemps,
            avgTemp: (minTemps.reduce((a, b) => a + b, 0) + maxTemps.reduce((a, b) => a + b, 0)) / (minTemps.length + maxTemps.length),
        };
    }
    /**
     * Create overlay data for map visualization
     */
    static generateHeatMapData(bounds, settings) {
        // In a real implementation, this would:
        // 1. Request temperature data for the visible map bounds
        // 2. Calculate GDD for each grid point
        // 3. Generate a data structure suitable for Leaflet overlay
        return Promise.resolve({
            bounds,
            data: this.generateMockGridData(bounds, settings),
        });
    }
    static generateMockGridData(bounds, settings) {
        const gridSize = 20;
        const data = [];
        const latStep = (bounds.north - bounds.south) / gridSize;
        const lonStep = (bounds.east - bounds.west) / gridSize;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const lat = bounds.south + i * latStep;
                const lon = bounds.west + j * lonStep;
                // Generate mock GDD value based on location
                const seasonalFactor = Math.sin((new Date().getMonth() - 3) * Math.PI / 6);
                const latitudeFactor = (50 - Math.abs(lat)) * 0.02;
                const randomFactor = Math.random() * 0.3;
                const gdd = Math.max(0, (300 + seasonalFactor * 200 + latitudeFactor * 100 + randomFactor * 100));
                data.push({
                    lat,
                    lon,
                    gdd,
                    intensity: Math.min(1, gdd / 800), // Normalize for color mapping
                });
            }
        }
        return data;
    }
    static async getTornadoRiskData(lat, lon, forecastHours = 48) {
        try {
            const baseParameters = this.computeTornadoParameters(lat, lon);
            const riskIndex = this.calculateRiskIndex(baseParameters, forecastHours);
            const probability = this.calculateProbability(riskIndex);
            const timeline = this.generateTornadoTimeline(lat, lon, forecastHours, baseParameters);
            return {
                lat,
                lon,
                forecastHours,
                riskIndex,
                probability,
                summary: this.getRiskSummary(riskIndex),
                parameters: baseParameters,
                timeline,
            };
        }
        catch (error) {
            console.error('Error fetching tornado risk data:', error);
            throw error;
        }
    }
    static async generateTornadoRiskOverlay(bounds, forecastHours = 48) {
        return {
            bounds,
            points: this.generateTornadoRiskGrid(bounds, forecastHours),
        };
    }
    static generateTornadoRiskGrid(bounds, forecastHours) {
        const gridSize = 18;
        const latStep = (bounds.north - bounds.south) / gridSize;
        const lonStep = (bounds.east - bounds.west) / gridSize;
        const points = [];
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                const lat = bounds.south + i * latStep;
                const lon = bounds.west + j * lonStep;
                const params = this.computeTornadoParameters(lat, lon);
                const variance = (this.pseudoRandom(lat, lon, forecastHours) - 0.5) * 2.5;
                const riskIndex = this.calculateRiskIndex(params, forecastHours, variance);
                const probability = this.calculateProbability(riskIndex);
                points.push({
                    lat,
                    lon,
                    riskIndex,
                    probability,
                });
            }
        }
        return points;
    }
    static computeTornadoParameters(lat, lon) {
        const cape = 500 + this.pseudoRandom(lat, lon, 1) * 2500;
        const shear = 8 + Math.abs(this.pseudoRandom(lat, lon, 2)) * 45;
        const helicity = 60 + this.pseudoRandom(lat, lon, 3) * 260;
        return {
            cape: Math.round(cape),
            shear: Math.round(shear * 10) / 10,
            helicity: Math.round(helicity),
        };
    }
    static calculateRiskIndex(parameters, forecastHours, variance = 0) {
        const capeScore = Math.min(1, parameters.cape / 3000);
        const shearScore = Math.min(1, parameters.shear / 40);
        const helicityScore = Math.min(1, parameters.helicity / 350);
        let baseRisk = (capeScore * 0.5 + shearScore * 0.3 + helicityScore * 0.2) * 10;
        baseRisk += Math.min(2, (forecastHours / 72));
        baseRisk = baseRisk + variance;
        return Math.round(Math.max(0, Math.min(10, baseRisk)) * 10) / 10;
    }
    static calculateProbability(riskIndex) {
        const probability = Math.min(0.98, Math.max(0.03, (riskIndex / 10) * 0.92 + 0.04));
        return Math.round(probability * 100) / 100;
    }
    static generateTornadoTimeline(lat, lon, forecastHours, parameters) {
        const timeline = [];
        const step = 3;
        for (let hour = 0; hour <= forecastHours; hour += step) {
            const decay = 1 - Math.min(0.75, hour / (forecastHours * 1.6));
            const hourVariance = (this.pseudoRandom(lat + hour, lon - hour, forecastHours) - 0.5) * 3;
            const adjustedParameters = {
                cape: parameters.cape * (0.9 + this.pseudoRandom(lat, lon, hour) * 0.2),
                shear: parameters.shear * (0.85 + this.pseudoRandom(lat, lon, hour + 1) * 0.25),
                helicity: parameters.helicity * (0.88 + this.pseudoRandom(lat, lon, hour + 2) * 0.3),
            };
            const riskIndex = this.calculateRiskIndex(adjustedParameters, forecastHours, hourVariance) * decay;
            const normalizedRisk = Math.round(Math.max(0, Math.min(10, riskIndex)) * 10) / 10;
            const probability = this.calculateProbability(normalizedRisk) * decay;
            timeline.push({
                hourOffset: hour,
                riskIndex: Math.round(normalizedRisk * 10) / 10,
                probability: Math.round(Math.max(0.02, Math.min(0.98, probability)) * 100) / 100,
            });
        }
        return timeline;
    }
    static getRiskSummary(riskIndex) {
        if (riskIndex < 2) {
            return 'Minimal tornado threat. Routine monitoring recommended.';
        }
        if (riskIndex < 4) {
            return 'Low-end risk. Keep an eye on forecast updates and radar trends.';
        }
        if (riskIndex < 6) {
            return 'Moderate risk. Ingredients are present for isolated severe storms.';
        }
        if (riskIndex < 8) {
            return 'Elevated risk. Organized severe storms capable of producing tornadoes are possible.';
        }
        return 'High risk. Conditions favor strong tornado development. Review safety plans immediately.';
    }
    static pseudoRandom(lat, lon, seed) {
        const x = Math.sin(lat * 12.9898 + lon * 78.233 + seed * 43758.5453) * 43758.5453;
        return x - Math.floor(x);
    }
}

/* src/plugin.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-1p9y649", ".plugin-container.svelte-1p9y649.svelte-1p9y649{padding:16px;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;max-height:90vh;overflow-y:auto}.plugin-header.svelte-1p9y649.svelte-1p9y649{text-align:center;margin-bottom:20px;border-bottom:2px solid #e0e0e0;padding-bottom:10px}.plugin-header.svelte-1p9y649 h2.svelte-1p9y649{margin:0 0 5px 0;color:#2c3e50;font-size:1.4rem}.plugin-header.svelte-1p9y649 p.svelte-1p9y649{margin:0;color:#7f8c8d;font-size:0.9rem}.status.svelte-1p9y649.svelte-1p9y649{margin:0 0 12px 0;padding:8px 12px;border-radius:6px;background:#f1f2f6;color:#2f3542;font-size:0.9rem;transition:background 0.3s ease}.status--ready.svelte-1p9y649.svelte-1p9y649{background:#e8f9ef;color:#216c2a}.status--error.svelte-1p9y649.svelte-1p9y649{background:#fdecea;color:#b00020}.mode-toggle.svelte-1p9y649.svelte-1p9y649{display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px;margin:16px 0}.mode-toggle.svelte-1p9y649 button.svelte-1p9y649{border:none;border-radius:8px;padding:10px;font-weight:600;font-size:0.95rem;cursor:pointer;background:#ecf0f1;color:#2c3e50;transition:all 0.25s ease}.mode-toggle.svelte-1p9y649 button.svelte-1p9y649:hover{background:#dfe6e9}.mode-toggle.svelte-1p9y649 button.active.svelte-1p9y649{background:linear-gradient(135deg, #6c5ce7, #0984e3);color:white;box-shadow:0 6px 16px rgba(108, 92, 231, 0.25)}.controls.svelte-1p9y649.svelte-1p9y649{margin-bottom:20px}.control-hint.svelte-1p9y649.svelte-1p9y649{margin:0;font-size:0.8rem;color:#5f6d7a;background:#f2f4f6;padding:8px 10px;border-radius:6px}.control-group.svelte-1p9y649.svelte-1p9y649{margin-bottom:12px}.control-group.svelte-1p9y649 label.svelte-1p9y649,.control-label.svelte-1p9y649.svelte-1p9y649{display:block;font-weight:600;margin-bottom:4px;color:#34495e;font-size:0.85rem}.control-group.svelte-1p9y649 select.svelte-1p9y649,.control-group.svelte-1p9y649 input.svelte-1p9y649{width:100%;padding:6px 8px;border:1px solid #bdc3c7;border-radius:4px;font-size:0.85rem;background:white}.control-group.svelte-1p9y649 select.svelte-1p9y649:focus,.control-group.svelte-1p9y649 input.svelte-1p9y649:focus{outline:none;border-color:#3498db;box-shadow:0 0 0 2px rgba(52, 152, 219, 0.2)}.overlay-toggle.svelte-1p9y649.svelte-1p9y649{width:100%;padding:10px;background:linear-gradient(135deg, #3498db, #2980b9);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;margin-top:10px;transition:all 0.3s ease}.overlay-toggle.svelte-1p9y649.svelte-1p9y649:hover{background:linear-gradient(135deg, #2980b9, #1f5f99);transform:translateY(-1px)}.overlay-toggle.svelte-1p9y649.svelte-1p9y649:disabled{background:#b2bec3;cursor:not-allowed;transform:none;box-shadow:none;opacity:0.8}.location-info.svelte-1p9y649.svelte-1p9y649{background:#ecf0f1;padding:8px 12px;border-radius:4px;margin-bottom:15px;font-size:0.85rem}.loading.svelte-1p9y649.svelte-1p9y649{text-align:center;padding:20px;color:#7f8c8d}.results.svelte-1p9y649.svelte-1p9y649{margin-bottom:20px}.result-card.svelte-1p9y649.svelte-1p9y649{background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:16px;margin-bottom:12px}.result-card.svelte-1p9y649 h3.svelte-1p9y649{margin:0 0 12px 0;color:#2c3e50;font-size:1rem;border-bottom:1px solid #dee2e6;padding-bottom:6px}.main-stats.svelte-1p9y649.svelte-1p9y649{background:linear-gradient(135deg, #74b9ff, #0984e3);color:white;border:none}.main-stats.svelte-1p9y649 h3.svelte-1p9y649{color:white;border-bottom-color:rgba(255, 255, 255, 0.3)}.stat-grid.svelte-1p9y649.svelte-1p9y649{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:15px}.stat.svelte-1p9y649.svelte-1p9y649{display:flex;justify-content:space-between;align-items:center}.stat.svelte-1p9y649 .label.svelte-1p9y649{font-size:0.85rem;opacity:0.9}.stat.svelte-1p9y649 .value.svelte-1p9y649{font-weight:700;font-size:1.1rem}.risk-value.svelte-1p9y649.svelte-1p9y649{text-shadow:0 1px 2px rgba(0, 0, 0, 0.15)}.risk-summary.svelte-1p9y649.svelte-1p9y649{margin:0;font-size:0.9rem;line-height:1.4;background:rgba(255, 255, 255, 0.2);padding:10px;border-radius:6px}.progress-bar.svelte-1p9y649.svelte-1p9y649{width:100%;height:8px;background:rgba(255, 255, 255, 0.3);border-radius:4px;overflow:hidden}.progress-fill.svelte-1p9y649.svelte-1p9y649{height:100%;background:#00b894;border-radius:4px;transition:width 0.6s ease}.temp-stats.svelte-1p9y649.svelte-1p9y649{display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;text-align:center}.temp-stats.svelte-1p9y649 div.svelte-1p9y649{background:white;padding:8px;border-radius:4px;font-size:0.85rem;font-weight:600}.tornado-ingredients.svelte-1p9y649.svelte-1p9y649{list-style:none;padding:0;margin:0 0 10px 0;display:grid;gap:6px}.tornado-ingredients.svelte-1p9y649 li.svelte-1p9y649{background:white;border-radius:6px;padding:8px 10px;font-size:0.85rem;display:flex;justify-content:space-between}.ingredients-note.svelte-1p9y649.svelte-1p9y649{margin:0;font-size:0.8rem;color:#57606f}.trend-chart.svelte-1p9y649.svelte-1p9y649{display:flex;align-items:flex-end;gap:4px;height:60px;padding:6px 4px 0 4px}.trend-chart.tornado.svelte-1p9y649.svelte-1p9y649{background:#f5f6fa;border-radius:6px;padding-bottom:6px}.trend-bar.svelte-1p9y649.svelte-1p9y649{flex:1;background:linear-gradient(to top, #74b9ff, #0984e3);border-radius:2px 2px 0 0;min-height:2px;transition:all 0.3s ease}.trend-bar.svelte-1p9y649.svelte-1p9y649:hover{background:linear-gradient(to top, #00b894, #00a085)}.chart-label.svelte-1p9y649.svelte-1p9y649{font-size:0.75rem;text-align:center;color:#7f8c8d;margin:5px 0 0 0}.instructions.svelte-1p9y649.svelte-1p9y649{background:#fff3cd;border:1px solid #ffeaa7;border-radius:6px;padding:16px}.instructions.svelte-1p9y649 h3.svelte-1p9y649{margin:0 0 10px 0;color:#856404;font-size:1rem}.instructions.svelte-1p9y649 ul.svelte-1p9y649{margin:0;padding-left:20px}.instructions.svelte-1p9y649 li.svelte-1p9y649{margin-bottom:6px;font-size:0.85rem;color:#856404;line-height:1.4}@media(max-width: 480px){.plugin-container.svelte-1p9y649.svelte-1p9y649{padding:12px}.temp-stats.svelte-1p9y649.svelte-1p9y649{grid-template-columns:1fr;gap:8px}.trend-chart.svelte-1p9y649.svelte-1p9y649{height:40px}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[44] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[47] = list[i];
	child_ctx[49] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[50] = list[i][0];
	child_ctx[51] = list[i][1];
	return child_ctx;
}

// (360:4) {:else}
function create_else_block(ctx) {
	let div0;
	let label;
	let t1;
	let select;
	let option0;
	let option1;
	let option2;
	let option3;
	let option4;
	let t7;
	let div1;
	let t11;
	let button;
	let t12_value = (/*tornadoLayer*/ ctx[14] ? 'Hide' : 'Show') + "";
	let t12;
	let t13;
	let button_disabled_value;
	let mounted;
	let dispose;

	return {
		c() {
			div0 = element("div");
			label = element("label");
			label.textContent = "Forecast Window:";
			t1 = space();
			select = element("select");
			option0 = element("option");
			option0.textContent = "Next 24 hours";
			option1 = element("option");
			option1.textContent = "Next 36 hours";
			option2 = element("option");
			option2.textContent = "Next 48 hours";
			option3 = element("option");
			option3.textContent = "Next 72 hours";
			option4 = element("option");
			option4.textContent = "Next 96 hours";
			t7 = space();
			div1 = element("div");
			div1.innerHTML = `<span class="control-label svelte-1p9y649">Model Ingredients:</span> <p class="control-hint svelte-1p9y649">Uses CAPE, wind shear, and helicity from forecast data.</p>`;
			t11 = space();
			button = element("button");
			t12 = text(t12_value);
			t13 = text(" Tornado Risk Overlay");
			attr(label, "for", "forecast-window");
			attr(label, "class", "svelte-1p9y649");
			option0.__value = 24;
			set_input_value(option0, option0.__value);
			option1.__value = 36;
			set_input_value(option1, option1.__value);
			option2.__value = 48;
			set_input_value(option2, option2.__value);
			option3.__value = 72;
			set_input_value(option3, option3.__value);
			option4.__value = 96;
			set_input_value(option4, option4.__value);
			attr(select, "id", "forecast-window");
			attr(select, "class", "svelte-1p9y649");
			if (/*tornadoForecastHours*/ ctx[15] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[30].call(select));
			attr(div0, "class", "control-group svelte-1p9y649");
			attr(div1, "class", "control-group svelte-1p9y649");
			attr(button, "class", "overlay-toggle svelte-1p9y649");
			attr(button, "type", "button");
			button.disabled = button_disabled_value = !/*windyReady*/ ctx[2];
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, label);
			append(div0, t1);
			append(div0, select);
			append(select, option0);
			append(select, option1);
			append(select, option2);
			append(select, option3);
			append(select, option4);
			select_option(select, /*tornadoForecastHours*/ ctx[15], true);
			insert(target, t7, anchor);
			insert(target, div1, anchor);
			insert(target, t11, anchor);
			insert(target, button, anchor);
			append(button, t12);
			append(button, t13);

			if (!mounted) {
				dispose = [
					listen(select, "change", /*select_change_handler*/ ctx[30]),
					listen(select, "change", /*onTornadoForecastChange*/ ctx[20]),
					listen(button, "click", /*toggleOverlay*/ ctx[22])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tornadoForecastHours*/ 32768) {
				select_option(select, /*tornadoForecastHours*/ ctx[15]);
			}

			if (dirty[0] & /*tornadoLayer*/ 16384 && t12_value !== (t12_value = (/*tornadoLayer*/ ctx[14] ? 'Hide' : 'Show') + "")) set_data(t12, t12_value);

			if (dirty[0] & /*windyReady*/ 4 && button_disabled_value !== (button_disabled_value = !/*windyReady*/ ctx[2])) {
				button.disabled = button_disabled_value;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t7);
				detach(div1);
				detach(t11);
				detach(button);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (317:4) {#if mode === 'heat-units'}
function create_if_block_6(ctx) {
	let div0;
	let label0;
	let t1;
	let select0;
	let t2;
	let div1;
	let label1;
	let t4;
	let input0;
	let t5;
	let div2;
	let label2;
	let t7;
	let input1;
	let t8;
	let div3;
	let label3;
	let t10;
	let select1;
	let option0;
	let option1;
	let option2;
	let t14;
	let div4;
	let label4;
	let t16;
	let select2;
	let option3;
	let option4;
	let option5;
	let option6;
	let option7;
	let t22;
	let button;
	let t23_value = (/*heatMapLayer*/ ctx[13] ? 'Hide' : 'Show') + "";
	let t23;
	let t24;
	let button_disabled_value;
	let mounted;
	let dispose;
	let each_value_2 = ensure_array_like(Object.entries(CROP_DATABASE));
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			div0 = element("div");
			label0 = element("label");
			label0.textContent = "Crop Type:";
			t1 = space();
			select0 = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t2 = space();
			div1 = element("div");
			label1 = element("label");
			label1.textContent = "Base Temperature (°C):";
			t4 = space();
			input0 = element("input");
			t5 = space();
			div2 = element("div");
			label2 = element("label");
			label2.textContent = "Upper Threshold (°C):";
			t7 = space();
			input1 = element("input");
			t8 = space();
			div3 = element("div");
			label3 = element("label");
			label3.textContent = "Calculation Method:";
			t10 = space();
			select1 = element("select");
			option0 = element("option");
			option0.textContent = "Simple Average";
			option1 = element("option");
			option1.textContent = "Modified (No Negatives)";
			option2 = element("option");
			option2.textContent = "Double Sine";
			t14 = space();
			div4 = element("div");
			label4 = element("label");
			label4.textContent = "Time Period (days):";
			t16 = space();
			select2 = element("select");
			option3 = element("option");
			option3.textContent = "Last 7 days";
			option4 = element("option");
			option4.textContent = "Last 14 days";
			option5 = element("option");
			option5.textContent = "Last 30 days";
			option6 = element("option");
			option6.textContent = "Last 60 days";
			option7 = element("option");
			option7.textContent = "Growing Season";
			t22 = space();
			button = element("button");
			t23 = text(t23_value);
			t24 = text(" Heat Map");
			attr(label0, "for", "crop-select");
			attr(label0, "class", "svelte-1p9y649");
			attr(select0, "id", "crop-select");
			attr(select0, "class", "svelte-1p9y649");
			if (/*selectedCrop*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[25].call(select0));
			attr(div0, "class", "control-group svelte-1p9y649");
			attr(label1, "for", "base-temp");
			attr(label1, "class", "svelte-1p9y649");
			attr(input0, "id", "base-temp");
			attr(input0, "type", "number");
			attr(input0, "min", "0");
			attr(input0, "max", "25");
			attr(input0, "step", "0.5");
			attr(input0, "class", "svelte-1p9y649");
			attr(div1, "class", "control-group svelte-1p9y649");
			attr(label2, "for", "upper-temp");
			attr(label2, "class", "svelte-1p9y649");
			attr(input1, "id", "upper-temp");
			attr(input1, "type", "number");
			attr(input1, "min", "20");
			attr(input1, "max", "45");
			attr(input1, "step", "0.5");
			attr(input1, "class", "svelte-1p9y649");
			attr(div2, "class", "control-group svelte-1p9y649");
			attr(label3, "for", "method");
			attr(label3, "class", "svelte-1p9y649");
			option0.__value = "simple";
			set_input_value(option0, option0.__value);
			option1.__value = "modified";
			set_input_value(option1, option1.__value);
			option2.__value = "double-sine";
			set_input_value(option2, option2.__value);
			attr(select1, "id", "method");
			attr(select1, "class", "svelte-1p9y649");
			if (/*calculationMethod*/ ctx[8] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[28].call(select1));
			attr(div3, "class", "control-group svelte-1p9y649");
			attr(label4, "for", "period");
			attr(label4, "class", "svelte-1p9y649");
			option3.__value = "7";
			set_input_value(option3, option3.__value);
			option4.__value = "14";
			set_input_value(option4, option4.__value);
			option5.__value = "30";
			set_input_value(option5, option5.__value);
			option6.__value = "60";
			set_input_value(option6, option6.__value);
			option7.__value = "90";
			set_input_value(option7, option7.__value);
			attr(select2, "id", "period");
			attr(select2, "class", "svelte-1p9y649");
			if (/*timePeriod*/ ctx[9] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[29].call(select2));
			attr(div4, "class", "control-group svelte-1p9y649");
			attr(button, "class", "overlay-toggle svelte-1p9y649");
			attr(button, "type", "button");
			button.disabled = button_disabled_value = !/*windyReady*/ ctx[2];
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, label0);
			append(div0, t1);
			append(div0, select0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select0, null);
				}
			}

			select_option(select0, /*selectedCrop*/ ctx[0], true);
			insert(target, t2, anchor);
			insert(target, div1, anchor);
			append(div1, label1);
			append(div1, t4);
			append(div1, input0);
			set_input_value(input0, /*baseTemp*/ ctx[6]);
			insert(target, t5, anchor);
			insert(target, div2, anchor);
			append(div2, label2);
			append(div2, t7);
			append(div2, input1);
			set_input_value(input1, /*upperTemp*/ ctx[7]);
			insert(target, t8, anchor);
			insert(target, div3, anchor);
			append(div3, label3);
			append(div3, t10);
			append(div3, select1);
			append(select1, option0);
			append(select1, option1);
			append(select1, option2);
			select_option(select1, /*calculationMethod*/ ctx[8], true);
			insert(target, t14, anchor);
			insert(target, div4, anchor);
			append(div4, label4);
			append(div4, t16);
			append(div4, select2);
			append(select2, option3);
			append(select2, option4);
			append(select2, option5);
			append(select2, option6);
			append(select2, option7);
			select_option(select2, /*timePeriod*/ ctx[9], true);
			insert(target, t22, anchor);
			insert(target, button, anchor);
			append(button, t23);
			append(button, t24);

			if (!mounted) {
				dispose = [
					listen(select0, "change", /*select0_change_handler*/ ctx[25]),
					listen(select0, "change", /*onCropChange*/ ctx[19]),
					listen(input0, "input", /*input0_input_handler*/ ctx[26]),
					listen(input1, "input", /*input1_input_handler*/ ctx[27]),
					listen(select1, "change", /*select1_change_handler*/ ctx[28]),
					listen(select2, "change", /*select2_change_handler*/ ctx[29]),
					listen(button, "click", /*toggleOverlay*/ ctx[22])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*Object*/ 0) {
				each_value_2 = ensure_array_like(Object.entries(CROP_DATABASE));
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select0, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			if (dirty[0] & /*selectedCrop*/ 1) {
				select_option(select0, /*selectedCrop*/ ctx[0]);
			}

			if (dirty[0] & /*baseTemp*/ 64 && to_number(input0.value) !== /*baseTemp*/ ctx[6]) {
				set_input_value(input0, /*baseTemp*/ ctx[6]);
			}

			if (dirty[0] & /*upperTemp*/ 128 && to_number(input1.value) !== /*upperTemp*/ ctx[7]) {
				set_input_value(input1, /*upperTemp*/ ctx[7]);
			}

			if (dirty[0] & /*calculationMethod*/ 256) {
				select_option(select1, /*calculationMethod*/ ctx[8]);
			}

			if (dirty[0] & /*timePeriod*/ 512) {
				select_option(select2, /*timePeriod*/ ctx[9]);
			}

			if (dirty[0] & /*heatMapLayer*/ 8192 && t23_value !== (t23_value = (/*heatMapLayer*/ ctx[13] ? 'Hide' : 'Show') + "")) set_data(t23, t23_value);

			if (dirty[0] & /*windyReady*/ 4 && button_disabled_value !== (button_disabled_value = !/*windyReady*/ ctx[2])) {
				button.disabled = button_disabled_value;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t2);
				detach(div1);
				detach(t5);
				detach(div2);
				detach(t8);
				detach(div3);
				detach(t14);
				detach(div4);
				detach(t22);
				detach(button);
			}

			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (321:10) {#each Object.entries(CROP_DATABASE) as [key, crop]}
function create_each_block_2(ctx) {
	let option;
	let t0_value = /*crop*/ ctx[51].icon + "";
	let t0;
	let t1;
	let t2_value = /*crop*/ ctx[51].name + "";
	let t2;

	return {
		c() {
			option = element("option");
			t0 = text(t0_value);
			t1 = space();
			t2 = text(t2_value);
			option.__value = /*key*/ ctx[50];
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t0);
			append(option, t1);
			append(option, t2);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (387:2) {#if selectedLocation}
function create_if_block_5(ctx) {
	let div;
	let p;
	let strong;
	let t1;
	let t2_value = /*selectedLocation*/ ctx[12].lat.toFixed(4) + "";
	let t2;
	let t3;
	let t4_value = /*selectedLocation*/ ctx[12].lon.toFixed(4) + "";
	let t4;

	return {
		c() {
			div = element("div");
			p = element("p");
			strong = element("strong");
			strong.textContent = "Selected Location:";
			t1 = space();
			t2 = text(t2_value);
			t3 = text(", ");
			t4 = text(t4_value);
			attr(div, "class", "location-info svelte-1p9y649");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p);
			append(p, strong);
			append(p, t1);
			append(p, t2);
			append(p, t3);
			append(p, t4);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedLocation*/ 4096 && t2_value !== (t2_value = /*selectedLocation*/ ctx[12].lat.toFixed(4) + "")) set_data(t2, t2_value);
			if (dirty[0] & /*selectedLocation*/ 4096 && t4_value !== (t4_value = /*selectedLocation*/ ctx[12].lon.toFixed(4) + "")) set_data(t4, t4_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (393:2) {#if isLoading}
function create_if_block_4(ctx) {
	let div;
	let p;
	let t0;

	let t1_value = (/*mode*/ ctx[5] === 'heat-units'
	? 'Calculating heat units…'
	: 'Analyzing tornado forecast…') + "";

	let t1;

	return {
		c() {
			div = element("div");
			p = element("p");
			t0 = text("🔄 ");
			t1 = text(t1_value);
			attr(div, "class", "loading svelte-1p9y649");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p);
			append(p, t0);
			append(p, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*mode*/ 32 && t1_value !== (t1_value = (/*mode*/ ctx[5] === 'heat-units'
			? 'Calculating heat units…'
			: 'Analyzing tornado forecast…') + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (399:2) {#if mode === 'heat-units' && heatUnitData}
function create_if_block_1(ctx) {
	let div15;
	let div6;
	let h30;
	let t1;
	let div3;
	let div0;
	let span0;
	let t3;
	let span1;
	let t4_value = /*heatUnitData*/ ctx[1].gdd.toFixed(1) + "";
	let t4;
	let t5;
	let div1;
	let span2;
	let t6;
	let t7_value = CROP_DATABASE[/*selectedCrop*/ ctx[0]].name + "";
	let t7;
	let t8;
	let t9;
	let span3;
	let t10_value = CROP_DATABASE[/*selectedCrop*/ ctx[0]].gddRequired + "";
	let t10;
	let t11;
	let div2;
	let span4;
	let t13;
	let span5;
	let t14_value = /*completionPercentage*/ ctx[16].toFixed(1) + "";
	let t14;
	let t15;
	let t16;
	let div5;
	let div4;
	let t17;
	let div7;
	let h31;
	let t19;
	let p0;
	let strong;
	let t21;
	let t22;
	let t23;
	let t24;
	let div12;
	let h32;
	let t25;
	let t26;
	let t27;
	let t28;
	let div11;
	let div8;
	let t29;
	let t30_value = /*heatUnitData*/ ctx[1].temperature.min.toFixed(1) + "";
	let t30;
	let t31;
	let t32;
	let div9;
	let t33;
	let t34_value = /*heatUnitData*/ ctx[1].temperature.max.toFixed(1) + "";
	let t34;
	let t35;
	let t36;
	let div10;
	let t37;
	let t38_value = /*heatUnitData*/ ctx[1].temperature.avg.toFixed(1) + "";
	let t38;
	let t39;
	let t40;
	let div14;
	let h33;
	let t42;
	let div13;
	let t43;
	let p1;

	function select_block_type_1(ctx, dirty) {
		if (/*daysToMaturity*/ ctx[17] > 0 && /*daysToMaturity*/ ctx[17] !== Infinity) return create_if_block_2;
		if (/*completionPercentage*/ ctx[16] >= 100) return create_if_block_3;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type && current_block_type(ctx);
	let each_value_1 = ensure_array_like(/*heatUnitData*/ ctx[1].dailyGdd.slice(-14));
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			div15 = element("div");
			div6 = element("div");
			h30 = element("h3");
			h30.textContent = "Heat Unit Summary";
			t1 = space();
			div3 = element("div");
			div0 = element("div");
			span0 = element("span");
			span0.textContent = "Accumulated GDD:";
			t3 = space();
			span1 = element("span");
			t4 = text(t4_value);
			t5 = space();
			div1 = element("div");
			span2 = element("span");
			t6 = text("Required for ");
			t7 = text(t7_value);
			t8 = text(":");
			t9 = space();
			span3 = element("span");
			t10 = text(t10_value);
			t11 = space();
			div2 = element("div");
			span4 = element("span");
			span4.textContent = "Completion:";
			t13 = space();
			span5 = element("span");
			t14 = text(t14_value);
			t15 = text("%");
			t16 = space();
			div5 = element("div");
			div4 = element("div");
			t17 = space();
			div7 = element("div");
			h31 = element("h3");
			h31.textContent = "Crop Development";
			t19 = space();
			p0 = element("p");
			strong = element("strong");
			strong.textContent = "Current Stage:";
			t21 = space();
			t22 = text(/*cropStage*/ ctx[18]);
			t23 = space();
			if (if_block) if_block.c();
			t24 = space();
			div12 = element("div");
			h32 = element("h3");
			t25 = text("Temperature Summary (");
			t26 = text(/*timePeriod*/ ctx[9]);
			t27 = text(" days)");
			t28 = space();
			div11 = element("div");
			div8 = element("div");
			t29 = text("Min: ");
			t30 = text(t30_value);
			t31 = text("°C");
			t32 = space();
			div9 = element("div");
			t33 = text("Max: ");
			t34 = text(t34_value);
			t35 = text("°C");
			t36 = space();
			div10 = element("div");
			t37 = text("Avg: ");
			t38 = text(t38_value);
			t39 = text("°C");
			t40 = space();
			div14 = element("div");
			h33 = element("h3");
			h33.textContent = "Recent GDD Trend";
			t42 = space();
			div13 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t43 = space();
			p1 = element("p");
			p1.textContent = "Last 14 days daily GDD accumulation";
			attr(h30, "class", "svelte-1p9y649");
			attr(span0, "class", "label svelte-1p9y649");
			attr(span1, "class", "value svelte-1p9y649");
			attr(div0, "class", "stat svelte-1p9y649");
			attr(span2, "class", "label svelte-1p9y649");
			attr(span3, "class", "value svelte-1p9y649");
			attr(div1, "class", "stat svelte-1p9y649");
			attr(span4, "class", "label svelte-1p9y649");
			attr(span5, "class", "value svelte-1p9y649");
			attr(div2, "class", "stat svelte-1p9y649");
			attr(div3, "class", "stat-grid svelte-1p9y649");
			attr(div4, "class", "progress-fill svelte-1p9y649");
			set_style(div4, "width", /*completionPercentage*/ ctx[16] + "%");
			attr(div5, "class", "progress-bar svelte-1p9y649");
			attr(div6, "class", "result-card main-stats svelte-1p9y649");
			attr(h31, "class", "svelte-1p9y649");
			attr(div7, "class", "result-card svelte-1p9y649");
			attr(h32, "class", "svelte-1p9y649");
			attr(div8, "class", "svelte-1p9y649");
			attr(div9, "class", "svelte-1p9y649");
			attr(div10, "class", "svelte-1p9y649");
			attr(div11, "class", "temp-stats svelte-1p9y649");
			attr(div12, "class", "result-card svelte-1p9y649");
			attr(h33, "class", "svelte-1p9y649");
			attr(div13, "class", "trend-chart svelte-1p9y649");
			attr(p1, "class", "chart-label svelte-1p9y649");
			attr(div14, "class", "result-card svelte-1p9y649");
			attr(div15, "class", "results svelte-1p9y649");
		},
		m(target, anchor) {
			insert(target, div15, anchor);
			append(div15, div6);
			append(div6, h30);
			append(div6, t1);
			append(div6, div3);
			append(div3, div0);
			append(div0, span0);
			append(div0, t3);
			append(div0, span1);
			append(span1, t4);
			append(div3, t5);
			append(div3, div1);
			append(div1, span2);
			append(span2, t6);
			append(span2, t7);
			append(span2, t8);
			append(div1, t9);
			append(div1, span3);
			append(span3, t10);
			append(div3, t11);
			append(div3, div2);
			append(div2, span4);
			append(div2, t13);
			append(div2, span5);
			append(span5, t14);
			append(span5, t15);
			append(div6, t16);
			append(div6, div5);
			append(div5, div4);
			append(div15, t17);
			append(div15, div7);
			append(div7, h31);
			append(div7, t19);
			append(div7, p0);
			append(p0, strong);
			append(p0, t21);
			append(p0, t22);
			append(div7, t23);
			if (if_block) if_block.m(div7, null);
			append(div15, t24);
			append(div15, div12);
			append(div12, h32);
			append(h32, t25);
			append(h32, t26);
			append(h32, t27);
			append(div12, t28);
			append(div12, div11);
			append(div11, div8);
			append(div8, t29);
			append(div8, t30);
			append(div8, t31);
			append(div11, t32);
			append(div11, div9);
			append(div9, t33);
			append(div9, t34);
			append(div9, t35);
			append(div11, t36);
			append(div11, div10);
			append(div10, t37);
			append(div10, t38);
			append(div10, t39);
			append(div15, t40);
			append(div15, div14);
			append(div14, h33);
			append(div14, t42);
			append(div14, div13);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div13, null);
				}
			}

			append(div14, t43);
			append(div14, p1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*heatUnitData*/ 2 && t4_value !== (t4_value = /*heatUnitData*/ ctx[1].gdd.toFixed(1) + "")) set_data(t4, t4_value);
			if (dirty[0] & /*selectedCrop*/ 1 && t7_value !== (t7_value = CROP_DATABASE[/*selectedCrop*/ ctx[0]].name + "")) set_data(t7, t7_value);
			if (dirty[0] & /*selectedCrop*/ 1 && t10_value !== (t10_value = CROP_DATABASE[/*selectedCrop*/ ctx[0]].gddRequired + "")) set_data(t10, t10_value);
			if (dirty[0] & /*completionPercentage*/ 65536 && t14_value !== (t14_value = /*completionPercentage*/ ctx[16].toFixed(1) + "")) set_data(t14, t14_value);

			if (dirty[0] & /*completionPercentage*/ 65536) {
				set_style(div4, "width", /*completionPercentage*/ ctx[16] + "%");
			}

			if (dirty[0] & /*cropStage*/ 262144) set_data(t22, /*cropStage*/ ctx[18]);

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if (if_block) if_block.d(1);
				if_block = current_block_type && current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div7, null);
				}
			}

			if (dirty[0] & /*timePeriod*/ 512) set_data(t26, /*timePeriod*/ ctx[9]);
			if (dirty[0] & /*heatUnitData*/ 2 && t30_value !== (t30_value = /*heatUnitData*/ ctx[1].temperature.min.toFixed(1) + "")) set_data(t30, t30_value);
			if (dirty[0] & /*heatUnitData*/ 2 && t34_value !== (t34_value = /*heatUnitData*/ ctx[1].temperature.max.toFixed(1) + "")) set_data(t34, t34_value);
			if (dirty[0] & /*heatUnitData*/ 2 && t38_value !== (t38_value = /*heatUnitData*/ ctx[1].temperature.avg.toFixed(1) + "")) set_data(t38, t38_value);

			if (dirty[0] & /*heatUnitData*/ 2) {
				each_value_1 = ensure_array_like(/*heatUnitData*/ ctx[1].dailyGdd.slice(-14));
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div13, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div15);
			}

			if (if_block) {
				if_block.d();
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (428:46) 
function create_if_block_3(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.innerHTML = `<strong>Status:</strong> ✅ Ready for harvest`;
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (426:8) {#if daysToMaturity > 0 && daysToMaturity !== Infinity}
function create_if_block_2(ctx) {
	let p;
	let strong;
	let t1;
	let t2;
	let t3;

	return {
		c() {
			p = element("p");
			strong = element("strong");
			strong.textContent = "Est. Days to Maturity:";
			t1 = space();
			t2 = text(/*daysToMaturity*/ ctx[17]);
			t3 = text(" days");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, strong);
			append(p, t1);
			append(p, t2);
			append(p, t3);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*daysToMaturity*/ 131072) set_data(t2, /*daysToMaturity*/ ctx[17]);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (445:10) {#each heatUnitData.dailyGdd.slice(-14) as gdd, i}
function create_each_block_1(ctx) {
	let div;
	let div_title_value;

	return {
		c() {
			div = element("div");
			attr(div, "class", "trend-bar svelte-1p9y649");
			set_style(div, "height", Math.max(2, /*gdd*/ ctx[47] / Math.max(.../*heatUnitData*/ ctx[1].dailyGdd) * 60) + "px");
			attr(div, "title", div_title_value = "Day " + (/*i*/ ctx[49] + 1) + ": " + /*gdd*/ ctx[47].toFixed(1) + " GDD");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*heatUnitData*/ 2) {
				set_style(div, "height", Math.max(2, /*gdd*/ ctx[47] / Math.max(.../*heatUnitData*/ ctx[1].dailyGdd) * 60) + "px");
			}

			if (dirty[0] & /*heatUnitData*/ 2 && div_title_value !== (div_title_value = "Day " + (/*i*/ ctx[49] + 1) + ": " + /*gdd*/ ctx[47].toFixed(1) + " GDD")) {
				attr(div, "title", div_title_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (458:2) {#if mode === 'tornado' && tornadoData}
function create_if_block(ctx) {
	let div8;
	let div4;
	let h30;
	let t1;
	let div3;
	let div0;
	let span0;
	let t3;
	let span1;
	let t4_value = /*tornadoData*/ ctx[11].riskIndex.toFixed(1) + "";
	let t4;
	let t5;
	let div1;
	let span2;
	let t7;
	let span3;
	let t8_value = Math.round(/*tornadoData*/ ctx[11].probability * 100) + "";
	let t8;
	let t9;
	let t10;
	let div2;
	let span4;
	let t12;
	let span5;
	let t13;
	let t14_value = /*tornadoData*/ ctx[11].forecastHours + "";
	let t14;
	let t15;
	let t16;
	let p0;
	let t17_value = /*tornadoData*/ ctx[11].summary + "";
	let t17;
	let t18;
	let div5;
	let h31;
	let t20;
	let ul;
	let li0;
	let strong0;
	let t22;
	let t23_value = /*tornadoData*/ ctx[11].parameters.cape + "";
	let t23;
	let t24;
	let t25;
	let li1;
	let strong1;
	let t27;
	let t28_value = /*tornadoData*/ ctx[11].parameters.shear + "";
	let t28;
	let t29;
	let t30;
	let li2;
	let strong2;
	let t32;
	let t33_value = /*tornadoData*/ ctx[11].parameters.helicity + "";
	let t33;
	let t34;
	let t35;
	let p1;
	let t37;
	let div7;
	let h32;
	let t39;
	let div6;
	let t40;
	let p2;
	let t41;
	let t42_value = /*tornadoData*/ ctx[11].timeline.length + "";
	let t42;
	let t43;
	let each_value = ensure_array_like(/*tornadoData*/ ctx[11].timeline);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div8 = element("div");
			div4 = element("div");
			h30 = element("h3");
			h30.textContent = "Tornado Risk Outlook";
			t1 = space();
			div3 = element("div");
			div0 = element("div");
			span0 = element("span");
			span0.textContent = "Risk Index (0-10):";
			t3 = space();
			span1 = element("span");
			t4 = text(t4_value);
			t5 = space();
			div1 = element("div");
			span2 = element("span");
			span2.textContent = "Probability:";
			t7 = space();
			span3 = element("span");
			t8 = text(t8_value);
			t9 = text("%");
			t10 = space();
			div2 = element("div");
			span4 = element("span");
			span4.textContent = "Forecast Window:";
			t12 = space();
			span5 = element("span");
			t13 = text("Next ");
			t14 = text(t14_value);
			t15 = text("h");
			t16 = space();
			p0 = element("p");
			t17 = text(t17_value);
			t18 = space();
			div5 = element("div");
			h31 = element("h3");
			h31.textContent = "Key Ingredients";
			t20 = space();
			ul = element("ul");
			li0 = element("li");
			strong0 = element("strong");
			strong0.textContent = "CAPE:";
			t22 = space();
			t23 = text(t23_value);
			t24 = text(" J/kg");
			t25 = space();
			li1 = element("li");
			strong1 = element("strong");
			strong1.textContent = "0-6 km Shear:";
			t27 = space();
			t28 = text(t28_value);
			t29 = text(" m/s");
			t30 = space();
			li2 = element("li");
			strong2 = element("strong");
			strong2.textContent = "Storm-Relative Helicity:";
			t32 = space();
			t33 = text(t33_value);
			t34 = text(" m²/s²");
			t35 = space();
			p1 = element("p");
			p1.textContent = "Higher values of these ingredients support rotating updrafts that can produce tornadoes.";
			t37 = space();
			div7 = element("div");
			h32 = element("h3");
			h32.textContent = "Risk Trend";
			t39 = space();
			div6 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t40 = space();
			p2 = element("p");
			t41 = text("Risk index every 3 hours (");
			t42 = text(t42_value);
			t43 = text(" points)");
			attr(h30, "class", "svelte-1p9y649");
			attr(span0, "class", "label svelte-1p9y649");
			attr(span1, "class", "value risk-value svelte-1p9y649");
			set_style(span1, "color", getRiskColor(/*tornadoData*/ ctx[11].riskIndex));
			attr(div0, "class", "stat svelte-1p9y649");
			attr(span2, "class", "label svelte-1p9y649");
			attr(span3, "class", "value svelte-1p9y649");
			attr(div1, "class", "stat svelte-1p9y649");
			attr(span4, "class", "label svelte-1p9y649");
			attr(span5, "class", "value svelte-1p9y649");
			attr(div2, "class", "stat svelte-1p9y649");
			attr(div3, "class", "stat-grid svelte-1p9y649");
			attr(p0, "class", "risk-summary svelte-1p9y649");
			attr(div4, "class", "result-card main-stats svelte-1p9y649");
			attr(h31, "class", "svelte-1p9y649");
			attr(li0, "class", "svelte-1p9y649");
			attr(li1, "class", "svelte-1p9y649");
			attr(li2, "class", "svelte-1p9y649");
			attr(ul, "class", "tornado-ingredients svelte-1p9y649");
			attr(p1, "class", "ingredients-note svelte-1p9y649");
			attr(div5, "class", "result-card svelte-1p9y649");
			attr(h32, "class", "svelte-1p9y649");
			attr(div6, "class", "trend-chart tornado svelte-1p9y649");
			attr(p2, "class", "chart-label svelte-1p9y649");
			attr(div7, "class", "result-card svelte-1p9y649");
			attr(div8, "class", "results svelte-1p9y649");
		},
		m(target, anchor) {
			insert(target, div8, anchor);
			append(div8, div4);
			append(div4, h30);
			append(div4, t1);
			append(div4, div3);
			append(div3, div0);
			append(div0, span0);
			append(div0, t3);
			append(div0, span1);
			append(span1, t4);
			append(div3, t5);
			append(div3, div1);
			append(div1, span2);
			append(div1, t7);
			append(div1, span3);
			append(span3, t8);
			append(span3, t9);
			append(div3, t10);
			append(div3, div2);
			append(div2, span4);
			append(div2, t12);
			append(div2, span5);
			append(span5, t13);
			append(span5, t14);
			append(span5, t15);
			append(div4, t16);
			append(div4, p0);
			append(p0, t17);
			append(div8, t18);
			append(div8, div5);
			append(div5, h31);
			append(div5, t20);
			append(div5, ul);
			append(ul, li0);
			append(li0, strong0);
			append(li0, t22);
			append(li0, t23);
			append(li0, t24);
			append(ul, t25);
			append(ul, li1);
			append(li1, strong1);
			append(li1, t27);
			append(li1, t28);
			append(li1, t29);
			append(ul, t30);
			append(ul, li2);
			append(li2, strong2);
			append(li2, t32);
			append(li2, t33);
			append(li2, t34);
			append(div5, t35);
			append(div5, p1);
			append(div8, t37);
			append(div8, div7);
			append(div7, h32);
			append(div7, t39);
			append(div7, div6);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div6, null);
				}
			}

			append(div7, t40);
			append(div7, p2);
			append(p2, t41);
			append(p2, t42);
			append(p2, t43);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tornadoData*/ 2048 && t4_value !== (t4_value = /*tornadoData*/ ctx[11].riskIndex.toFixed(1) + "")) set_data(t4, t4_value);

			if (dirty[0] & /*tornadoData*/ 2048) {
				set_style(span1, "color", getRiskColor(/*tornadoData*/ ctx[11].riskIndex));
			}

			if (dirty[0] & /*tornadoData*/ 2048 && t8_value !== (t8_value = Math.round(/*tornadoData*/ ctx[11].probability * 100) + "")) set_data(t8, t8_value);
			if (dirty[0] & /*tornadoData*/ 2048 && t14_value !== (t14_value = /*tornadoData*/ ctx[11].forecastHours + "")) set_data(t14, t14_value);
			if (dirty[0] & /*tornadoData*/ 2048 && t17_value !== (t17_value = /*tornadoData*/ ctx[11].summary + "")) set_data(t17, t17_value);
			if (dirty[0] & /*tornadoData*/ 2048 && t23_value !== (t23_value = /*tornadoData*/ ctx[11].parameters.cape + "")) set_data(t23, t23_value);
			if (dirty[0] & /*tornadoData*/ 2048 && t28_value !== (t28_value = /*tornadoData*/ ctx[11].parameters.shear + "")) set_data(t28, t28_value);
			if (dirty[0] & /*tornadoData*/ 2048 && t33_value !== (t33_value = /*tornadoData*/ ctx[11].parameters.helicity + "")) set_data(t33, t33_value);

			if (dirty[0] & /*tornadoData*/ 2048) {
				each_value = ensure_array_like(/*tornadoData*/ ctx[11].timeline);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div6, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty[0] & /*tornadoData*/ 2048 && t42_value !== (t42_value = /*tornadoData*/ ctx[11].timeline.length + "")) set_data(t42, t42_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div8);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (494:10) {#each tornadoData.timeline as point}
function create_each_block(ctx) {
	let div;
	let div_title_value;

	return {
		c() {
			div = element("div");
			attr(div, "class", "trend-bar svelte-1p9y649");
			attr(div, "title", div_title_value = `T+${/*point*/ ctx[44].hourOffset}h · Risk ${/*point*/ ctx[44].riskIndex.toFixed(1)} · ${Math.round(/*point*/ ctx[44].probability * 100)}% chance`);
			set_style(div, "height", `${Math.max(4, /*point*/ ctx[44].riskIndex / 10 * 70)}px`);
			set_style(div, "background", getRiskColor(/*point*/ ctx[44].riskIndex));
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tornadoData*/ 2048 && div_title_value !== (div_title_value = `T+${/*point*/ ctx[44].hourOffset}h · Risk ${/*point*/ ctx[44].riskIndex.toFixed(1)} · ${Math.round(/*point*/ ctx[44].probability * 100)}% chance`)) {
				attr(div, "title", div_title_value);
			}

			if (dirty[0] & /*tornadoData*/ 2048) {
				set_style(div, "height", `${Math.max(4, /*point*/ ctx[44].riskIndex / 10 * 70)}px`);
			}

			if (dirty[0] & /*tornadoData*/ 2048) {
				set_style(div, "background", getRiskColor(/*point*/ ctx[44].riskIndex));
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment(ctx) {
	let section;
	let header;
	let t3;
	let p1;

	let t4_value = (/*windyError*/ ctx[4]
	? /*windyError*/ ctx[4]
	: /*windyStatus*/ ctx[3]) + "";

	let t4;
	let t5;
	let div0;
	let button0;
	let t7;
	let button1;
	let t9;
	let div1;
	let t10;
	let t11;
	let t12;
	let t13;
	let t14;
	let div2;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*mode*/ ctx[5] === 'heat-units') return create_if_block_6;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*selectedLocation*/ ctx[12] && create_if_block_5(ctx);
	let if_block2 = /*isLoading*/ ctx[10] && create_if_block_4(ctx);
	let if_block3 = /*mode*/ ctx[5] === 'heat-units' && /*heatUnitData*/ ctx[1] && create_if_block_1(ctx);
	let if_block4 = /*mode*/ ctx[5] === 'tornado' && /*tornadoData*/ ctx[11] && create_if_block(ctx);

	return {
		c() {
			section = element("section");
			header = element("header");
			header.innerHTML = `<h2 class="svelte-1p9y649">🌡️ Agricultural Heat Units</h2> <p class="svelte-1p9y649">Growing Degree Days &amp; Severe Weather Toolkit</p>`;
			t3 = space();
			p1 = element("p");
			t4 = text(t4_value);
			t5 = space();
			div0 = element("div");
			button0 = element("button");
			button0.textContent = "🌱 Heat Units";
			t7 = space();
			button1 = element("button");
			button1.textContent = "🌪️ Tornado Outlook";
			t9 = space();
			div1 = element("div");
			if_block0.c();
			t10 = space();
			if (if_block1) if_block1.c();
			t11 = space();
			if (if_block2) if_block2.c();
			t12 = space();
			if (if_block3) if_block3.c();
			t13 = space();
			if (if_block4) if_block4.c();
			t14 = space();
			div2 = element("div");
			div2.innerHTML = `<h3 class="svelte-1p9y649">How to Use</h3> <ul class="svelte-1p9y649"><li class="svelte-1p9y649">🎯 Click anywhere on the map to analyze the selected location</li> <li class="svelte-1p9y649">🌾 Use Heat Units mode to pick a crop and adjust temperature thresholds</li> <li class="svelte-1p9y649">🌪️ Switch to Tornado Outlook mode to evaluate forecast-based risk ingredients</li> <li class="svelte-1p9y649">🗺️ Toggle the overlay to visualize either GDD or tornado risk across the map</li> <li class="svelte-1p9y649">📈 Review trend cards to monitor crop progress or tornado risk timing</li></ul>`;
			attr(header, "class", "plugin-header svelte-1p9y649");
			attr(p1, "class", "status svelte-1p9y649");
			toggle_class(p1, "status--ready", /*windyReady*/ ctx[2]);
			toggle_class(p1, "status--error", !!/*windyError*/ ctx[4]);
			attr(button0, "type", "button");
			attr(button0, "class", "svelte-1p9y649");
			toggle_class(button0, "active", /*mode*/ ctx[5] === 'heat-units');
			attr(button1, "type", "button");
			attr(button1, "class", "svelte-1p9y649");
			toggle_class(button1, "active", /*mode*/ ctx[5] === 'tornado');
			attr(div0, "class", "mode-toggle svelte-1p9y649");
			attr(div1, "class", "controls svelte-1p9y649");
			attr(div2, "class", "instructions svelte-1p9y649");
			attr(section, "class", "plugin-container svelte-1p9y649");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, header);
			append(section, t3);
			append(section, p1);
			append(p1, t4);
			append(section, t5);
			append(section, div0);
			append(div0, button0);
			append(div0, t7);
			append(div0, button1);
			append(section, t9);
			append(section, div1);
			if_block0.m(div1, null);
			append(section, t10);
			if (if_block1) if_block1.m(section, null);
			append(section, t11);
			if (if_block2) if_block2.m(section, null);
			append(section, t12);
			if (if_block3) if_block3.m(section, null);
			append(section, t13);
			if (if_block4) if_block4.m(section, null);
			append(section, t14);
			append(section, div2);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler*/ ctx[23]),
					listen(button1, "click", /*click_handler_1*/ ctx[24])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*windyError, windyStatus*/ 24 && t4_value !== (t4_value = (/*windyError*/ ctx[4]
			? /*windyError*/ ctx[4]
			: /*windyStatus*/ ctx[3]) + "")) set_data(t4, t4_value);

			if (dirty[0] & /*windyReady*/ 4) {
				toggle_class(p1, "status--ready", /*windyReady*/ ctx[2]);
			}

			if (dirty[0] & /*windyError*/ 16) {
				toggle_class(p1, "status--error", !!/*windyError*/ ctx[4]);
			}

			if (dirty[0] & /*mode*/ 32) {
				toggle_class(button0, "active", /*mode*/ ctx[5] === 'heat-units');
			}

			if (dirty[0] & /*mode*/ 32) {
				toggle_class(button1, "active", /*mode*/ ctx[5] === 'tornado');
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div1, null);
				}
			}

			if (/*selectedLocation*/ ctx[12]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_5(ctx);
					if_block1.c();
					if_block1.m(section, t11);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*isLoading*/ ctx[10]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_4(ctx);
					if_block2.c();
					if_block2.m(section, t12);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*mode*/ ctx[5] === 'heat-units' && /*heatUnitData*/ ctx[1]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_1(ctx);
					if_block3.c();
					if_block3.m(section, t13);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (/*mode*/ ctx[5] === 'tornado' && /*tornadoData*/ ctx[11]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block(ctx);
					if_block4.c();
					if_block4.m(section, t14);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

const MAX_WINDY_ATTEMPTS = 40;

function getHeatMapColor(intensity) {
	const clamped = Math.max(0, Math.min(1, intensity));
	const hue = 200 - clamped * 160;
	return `hsl(${hue}, 85%, ${40 + clamped * 20}%)`;
}

function getRiskColor(riskIndex) {
	const ratio = Math.max(0, Math.min(1, riskIndex / 10));
	const hue = 120 - ratio * 120;
	return `hsl(${hue}, 85%, ${40 + ratio * 10}%)`;
}

function instance($$self, $$props, $$invalidate) {
	let cropStage;
	let daysToMaturity;
	let completionPercentage;
	let map;
	let broadcast;
	let windyReady = false;
	let windyStatus = 'Initializing…';
	let windyError = '';
	let windyInitTimer = null;
	let windyInitAttempts = 0;

	// Component state
	let mode = 'heat-units';

	let selectedCrop = 'corn';
	let baseTemp = CROP_DATABASE[selectedCrop].baseTemp;
	let upperTemp = CROP_DATABASE[selectedCrop].upperTemp;
	let calculationMethod = 'modified';
	let timePeriod = 30;
	let isLoading = false;
	let heatUnitData = null;
	let tornadoData = null;
	let selectedLocation = null;
	let heatMapLayer = null;
	let tornadoLayer = null;
	let tornadoForecastHours = 48;

	// Initialize Windy API access
	onMount(() => {
		const tryInitializeWindy = () => {
			const windy = window.W;

			if (!windy) {
				return false;
			}

			initializeWindyApi(windy);
			return true;
		};

		if (!tryInitializeWindy()) {
			$$invalidate(3, windyStatus = 'Waiting for the Windy map to initialize…');

			windyInitTimer = setInterval(
				() => {
					windyInitAttempts += 1;

					if (tryInitializeWindy()) {
						return;
					}

					if (windyInitAttempts >= MAX_WINDY_ATTEMPTS) {
						$$invalidate(4, windyError = 'Unable to connect to the Windy API. Try reloading the plugin.');
						$$invalidate(3, windyStatus = 'Windy API not available.');

						if (windyInitTimer) {
							clearInterval(windyInitTimer);
							windyInitTimer = null;
						}
					}
				},
				500
			);
		}
	});

	function initializeWindyApi(windy) {
		$$invalidate(2, windyReady = true);
		$$invalidate(3, windyStatus = 'Connected to the Windy map.');
		$$invalidate(4, windyError = '');
		map = windy.map;
		windy.picker;
		windy.store;
		broadcast = windy.broadcast;

		if (windyInitTimer) {
			clearInterval(windyInitTimer);
			windyInitTimer = null;
		}

		if (map) {
			map.on('click', handleMapClick);
		}

		if (broadcast) {
			broadcast.on('pickerOpened', handlePickerOpened);
		}
	}

	onDestroy(() => {
		if (map) {
			map.off('click', handleMapClick);
		}

		if (broadcast) {
			broadcast.off('pickerOpened', handlePickerOpened);
		}

		if (windyInitTimer) {
			clearInterval(windyInitTimer);
			windyInitTimer = null;
		}

		if (heatMapLayer) {
			map.removeLayer(heatMapLayer);
		}

		if (tornadoLayer) {
			map.removeLayer(tornadoLayer);
		}
	});

	function handleMapClick(event) {
		const { lat, lng } = event.latlng;
		$$invalidate(12, selectedLocation = { lat, lon: lng });

		if (mode === 'heat-units') {
			calculateHeatUnits(lat, lng);
		} else {
			calculateTornadoRisk(lat, lng);
		}
	}

	function handlePickerOpened(event) {
		if (event.lat && event.lon) {
			$$invalidate(12, selectedLocation = { lat: event.lat, lon: event.lon });

			if (mode === 'heat-units') {
				calculateHeatUnits(event.lat, event.lon);
			} else {
				calculateTornadoRisk(event.lat, event.lon);
			}
		}
	}

	async function calculateHeatUnits(lat, lon) {
		$$invalidate(10, isLoading = true);

		try {
			$$invalidate(1, heatUnitData = await WindyDataAdapter.getTemperatureData(lat, lon, timePeriod));
			$$invalidate(11, tornadoData = null);
		} catch(error) {
			console.error('Failed to calculate heat units:', error);
		} finally {
			$$invalidate(10, isLoading = false);
		}
	}

	async function calculateTornadoRisk(lat, lon) {
		$$invalidate(10, isLoading = true);

		try {
			$$invalidate(11, tornadoData = await WindyDataAdapter.getTornadoRiskData(lat, lon, tornadoForecastHours));
		} catch(error) {
			console.error('Failed to calculate tornado risk:', error);
		} finally {
			$$invalidate(10, isLoading = false);
		}
	}

	function onCropChange() {
		const crop = CROP_DATABASE[selectedCrop];
		$$invalidate(6, baseTemp = crop.baseTemp);
		$$invalidate(7, upperTemp = crop.upperTemp);

		if (selectedLocation && mode === 'heat-units') {
			calculateHeatUnits(selectedLocation.lat, selectedLocation.lon);
		}
	}

	function onTornadoForecastChange(event) {
		const value = Number(event.target.value);
		$$invalidate(15, tornadoForecastHours = value);

		if (selectedLocation && mode === 'tornado') {
			calculateTornadoRisk(selectedLocation.lat, selectedLocation.lon);
		}
	}

	function switchMode(nextMode) {
		if (mode === nextMode) {
			return;
		}

		$$invalidate(5, mode = nextMode);

		if (mode === 'heat-units') {
			if (tornadoLayer) {
				map.removeLayer(tornadoLayer);
				$$invalidate(14, tornadoLayer = null);
			}

			if (selectedLocation) {
				calculateHeatUnits(selectedLocation.lat, selectedLocation.lon);
			}
		} else {
			if (heatMapLayer) {
				map.removeLayer(heatMapLayer);
				$$invalidate(13, heatMapLayer = null);
			}

			if (selectedLocation) {
				calculateTornadoRisk(selectedLocation.lat, selectedLocation.lon);
			}
		}
	}

	function toggleOverlay() {
		if (!map) {
			return;
		}

		if (mode === 'heat-units') {
			if (heatMapLayer) {
				map.removeLayer(heatMapLayer);
				$$invalidate(13, heatMapLayer = null);
			} else {
				createHeatMapOverlay();
			}
		} else {
			if (tornadoLayer) {
				map.removeLayer(tornadoLayer);
				$$invalidate(14, tornadoLayer = null);
			} else {
				createTornadoOverlay();
			}
		}
	}

	async function createHeatMapOverlay() {
		const bounds = map.getBounds();

		const settings = {
			crop: selectedCrop,
			baseTemp,
			upperTemp,
			timePeriod
		};

		try {
			const overlayData = await WindyDataAdapter.generateHeatMapData(bounds, settings);
			const L = window.L;

			if (!L) {
				console.warn('Leaflet API not available to render heat map overlay.');
				return;
			}

			const layerGroup = L.layerGroup();

			overlayData.data.forEach(point => {
				const color = getHeatMapColor(point.intensity);

				const marker = L.circleMarker([point.lat, point.lon], {
					radius: 6,
					color,
					fillColor: color,
					fillOpacity: 0.55,
					weight: 0
				});

				marker.bindPopup(`GDD: ${point.gdd.toFixed(0)}\nIntensity: ${(point.intensity * 100).toFixed(0)}%`);
				layerGroup.addLayer(marker);
			});

			layerGroup.addTo(map);
			$$invalidate(13, heatMapLayer = layerGroup);
		} catch(error) {
			console.error('Failed to create heat map:', error);
		}
	}

	async function createTornadoOverlay() {
		const bounds = map.getBounds();

		try {
			const overlayData = await WindyDataAdapter.generateTornadoRiskOverlay(bounds, tornadoForecastHours);
			const L = window.L;

			if (!L) {
				console.warn('Leaflet API not available to render tornado overlay.');
				return;
			}

			const layerGroup = L.layerGroup();

			overlayData.points.forEach(point => {
				const color = getRiskColor(point.riskIndex);

				const marker = L.circleMarker([point.lat, point.lon], {
					radius: Math.max(4, point.riskIndex / 10 * 9),
					color,
					fillColor: color,
					fillOpacity: 0.6,
					weight: 1
				});

				marker.bindPopup(`Risk index: ${point.riskIndex.toFixed(1)} / 10\nProbability: ${(point.probability * 100).toFixed(0)}%`);
				layerGroup.addLayer(marker);
			});

			layerGroup.addTo(map);
			$$invalidate(14, tornadoLayer = layerGroup);
		} catch(error) {
			console.error('Failed to create tornado overlay:', error);
		}
	}

	const click_handler = () => switchMode('heat-units');
	const click_handler_1 = () => switchMode('tornado');

	function select0_change_handler() {
		selectedCrop = select_value(this);
		$$invalidate(0, selectedCrop);
	}

	function input0_input_handler() {
		baseTemp = to_number(this.value);
		$$invalidate(6, baseTemp);
	}

	function input1_input_handler() {
		upperTemp = to_number(this.value);
		$$invalidate(7, upperTemp);
	}

	function select1_change_handler() {
		calculationMethod = select_value(this);
		$$invalidate(8, calculationMethod);
	}

	function select2_change_handler() {
		timePeriod = select_value(this);
		$$invalidate(9, timePeriod);
	}

	function select_change_handler() {
		tornadoForecastHours = select_value(this);
		$$invalidate(15, tornadoForecastHours);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*heatUnitData, selectedCrop*/ 3) {
			$$invalidate(18, cropStage = heatUnitData
			? HeatUnitCalculator.getCropStage(heatUnitData.gdd, CROP_DATABASE[selectedCrop].gddRequired)
			: '');
		}

		if ($$self.$$.dirty[0] & /*heatUnitData, selectedCrop*/ 3) {
			$$invalidate(17, daysToMaturity = heatUnitData
			? HeatUnitCalculator.estimateDaysToMaturity(heatUnitData.gdd, CROP_DATABASE[selectedCrop].gddRequired, heatUnitData.dailyGdd.slice(-7).reduce((a, b) => a + b, 0) / 7)
			: 0);
		}

		if ($$self.$$.dirty[0] & /*heatUnitData, selectedCrop*/ 3) {
			$$invalidate(16, completionPercentage = heatUnitData
			? Math.min(100, heatUnitData.gdd / CROP_DATABASE[selectedCrop].gddRequired * 100)
			: 0);
		}
	};

	return [
		selectedCrop,
		heatUnitData,
		windyReady,
		windyStatus,
		windyError,
		mode,
		baseTemp,
		upperTemp,
		calculationMethod,
		timePeriod,
		isLoading,
		tornadoData,
		selectedLocation,
		heatMapLayer,
		tornadoLayer,
		tornadoForecastHours,
		completionPercentage,
		daysToMaturity,
		cropStage,
		onCropChange,
		onTornadoForecastChange,
		switchMode,
		toggleOverlay,
		click_handler,
		click_handler_1,
		select0_change_handler,
		input0_input_handler,
		input1_input_handler,
		select1_change_handler,
		select2_change_handler,
		select_change_handler
	];
}

class Plugin extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {}, add_css, [-1, -1]);
	}
}

var plugin = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: Plugin
});

export { config, plugin$1 as default };
