'use strict';

var _ = require("substance/helpers");
var Component = require('substance/ui/component');
var Icon = require("substance/ui/font_awesome_icon");
var $$ = Component.$$;

class CitePanel extends Component {

  constructor(parent, props) {
    super(parent, props);

    this.onClick = this.onClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  didMount() {
    this.$el.on('click', '.back', this.handleCancel);
    this.stateFromAppState();
    this.tool = this.context.toolRegistry.get('cite');
    if (!this.tool) throw new Error('cite tool not found in registry');
  }

  willReceiveProps() {
    this.stateFromAppState();
  }

  willUnmount() {
    this.$el.off('click', '.back', this.handleCancel);
    this.tool.disconnect(this);
  }

  // Determines wheter an item is active
  isItemActive(itemId) {
    if (!this.state.citationId) return false;
    var doc = this.props.doc;
    var citation = doc.get(this.state.citationId);
    return _.includes(citation.targets, itemId);
  }

  // Rendering
  // -------------------

  get classNames() {
    return "panel dialog cite-panel-component";
  }

  render() {
    var self = this;
    var componentRegistry = this.context.componentRegistry;

    var items = this.state.items;
    var itemEls;

    if (items.length > 0) {
      itemEls = items.map(function(item) {
        var comp = componentRegistry.get("_cite_" + this.state.citationType);
        return $$(comp, {
          key: item.id,
          node: item,
          active: this.isItemActive(item.id),
        });
      }.bind(this));
    } else {
      itemEls = [$$('div', {className: "no-results", text: "Nothing to reference."})];
    }

    return [
      $$('div', {classNames: "dialog-header"},
        $$('a', {
          href: "#",
          classNames: 'back',
        }, $$(Icon, {icon: 'fa-chevron-left'})),
        $$('div', {classNames: 'label'}, "Choose referenced items")
      ),
      $$('div', {classNames: "panel-content"},
        $$('div', {classNames: "bib-items"},
          itemEls
        )
      )
    ];
  }

  handleCancel(e) {
    e.preventDefault();
    this.send("switchContext", "toc");
  }

  getItems(citationType) {
    var doc = this.props.doc;
    var collection = doc.getCollection(citationType);
    return collection.getItems();
  }

  stateFromAppState() {
    var app = this.context.app;
    this.state = {
      citationType: app.state.citationType,
      items: this.getItems(app.state.citationType),
      citationId: app.state.citationId
    };
  }

  // Called with entityId when an entity has been clicked
  handleSelection(targetId) {
    var citationId = this.state.citationId;
    this.tool.toggleTarget(citationId, targetId);
    this.rerender();
  }
}

// Panel configuration
// ----------------

CitePanel.icon = "fa-bullseye";

// No context switch toggle is shown
CitePanel.isDialog = true;

module.exports = CitePanel;