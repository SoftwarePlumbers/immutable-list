
const debug = require('debug')('immutable-list');
const Stream = require('iterator-plumbing');


/** Abstract list provides most list functions.
 *
 * List API is as close as possible to the vanilla Array object. However mutating operations are
 * implemented via lazy copy, and bulk operations (such as map, filter and concat) are also 
 * implemneted via a lazy proxt enabling such operations to be chained without creating temporary
 * copies of the underlying data.
 *
 */
class AbstractList {

	/** Get length of array */
	get length() {
		return this.data.length;
	}

	/** Check to see if an object is an immutable list */
	static isList(obj) {
		return obj instanceof AbstractList;
	}

	/** Create a list */
	static of() {
		return ImmutableList.from(Array.of(...arguments));
	}

	/** Create a list from base array 
	*
	* List wraps supplied data - so don't change that data after supplying it to list. If data
	* is already an immutable list, just passes through the reference. This avoids accidentally
	* wrapping a list in a list, and is semantically valid (since a list is immutable, a reference
	* is as good as a copy)
	*
	* @param data array
	*/
	static from(data) {
		if (AbstractList.isList(data)) return data;
		return new Proxy(new ImmutableList(data), HANDLER);
	}

	/** Concatenate two arrays
	* 
	*/
	concat(iterable) {
		return StreamLazyList.from(()=>Stream.from(this).concat(Stream.from(iterable)));
	}

	/** Copy elements within an array 
	*/
	copyWithin(target, start, end) {
		return BufferLazyList.from(()=>this.buffer().copyWithin(target, start, end));
	}

	/** Get an iterator over array entries */
	entries() {
		return { [Symbol.iterator] : () => Stream.from(this).entries() };
	}

	/** Check to see whether a function evaluates true for every element in the array
	*
	* @param callback {Function} function [like: (value, index) => boolean] to evaluate
	*/
	every(callback, thisArg) {
		return Stream.from(this).every(callback, this);
	}

	/** Fill all elements in an array with a value
	*
	* @param value to fill with.
	* @return new list with values filled.
	*/
	fill(value) {
		return BufferLazyList.from(() => this.buffer().fill(value));
	}

	/** Create a new list from elements matching the predicate
	*
	* method returns a new immutable list with elements that satisfy the provided testing function. 
	*
	* @param {Function} predicate
	*/	
	filter(predicate, thisArg) {
		return StreamLazyList.from(()=>Stream.from(this).filter(predicate, this));	
	}

	/** Find the element matching the predicate
	*
	* method returns the index of the first element in the array that satisfies the provided testing function. 
	*
	* @param {Function} predicate
	*/	
	find(predicate, thisArg) {
		return Stream.from(this).find(predicate, this);
	}

	/** Find the element matching the predicate
	*
	* method returns the index of the first element in the array that satisfies the provided testing function. Otherwise -1 is returned
	*/
	findIndex(predicate, thisArg) {
		return Stream.from(this).findIndex(predicate, this);
	}

	/** Execute a function for each mapped value
	*
 	* @param callback {Function} function to execute
	*/
	forEach(callback, thisArg) {
		return Stream.from(this).forEach(callback, this);
	}

	/** Get the item for a given index
	*
	* @param index item to look for
	* @returns item for index
	*/
	get(index) {
		return this.data[index];
	}

	/** Check if an item is in an array.
	*
	* determines whether an array includes a certain element, returning true or false as appropriate
	* @param element item to check for
	*/
	includes(element) {
		return Stream.from(this).includes(element);
	}

	/** Get index of an item in an array
	*
	* @param element item to find
	* @param start point for search
	* @return index of item, or -1
	*/
	indexOf(element, start) {
		return this.data.indexOf(element, start);
	}

	/** Join items in an array into a string
	*
	* @param separator {String} separator between items
	*/
	join(separator) {
		return Stream.from(this).join(separator);
	}

	/** Get an iterator over keys */
	keys() {
		return new Stream(this.data.keys());
	}

	/** Get last index of an element
	*
	* @param element item to search for.
	* @preturns last index of element in the array, or -1
	*/
	lastIndexOf(element) {
		return this.data.lastIndexOf(element);
	}

	/** Map values into a new array
	*
	* @param mapper {Function} function to map elements
	* @returns a new Immutable list with the result of applying mapper to every element in this list
	*/
	map(mapper) {
		return StreamLazyList.from(()=>Stream.from(this).map(mapper));
	}

	push() {
		return StreamLazyList.from(()=>Stream.from(this).push(...arguments));
	}

	reduce(reducer, value) {
		return Stream.from(this).reduce(reducer, value, this);
	}

	slice(begin, end) {
		return BufferLazyList.from(()=>this.buffer().slice(begin, end));
	}

	some(predicate) {
		return Stream.from(this).some(predicate);
	}

	toString() {
		return '[' + Stream.from(this).join(',') + ']'
	}

	/** Get an iterator over values */
	values() {
		return Stream.from(this);
	}

	/** Set a value for an index.
	*
	* A lazy copy is implemented; the data will not actually be copied until an 
	* attempt is made to read it.
	*
	* @param index for value
	* @param value value to store for index
	* @returns a copy of this map with the new value included
	*/
	set(index, value) {
		return BufferLazyList.from(() => { const buffer = this.buffer(); buffer[index]=value; return buffer; });
	}

	/** Remove the value stored for a key.
	*
	* A lazy copy is implemented; the map data will not actually be copied until an 
	* attempt is made to read it.
	*
	* @param index to remove
	* @returns a copy of this array with the specified index removed
	*/
	delete(index) {
		return BufferLazyList.from(() => { let copy = this.buffer(); delete copy[index]; return copy; });
	}

	/** Return value to be serialized as JSON
	*
	* For performance, this (may) return a copy of the internal array representation. As such,
	* the result of calling this method *should not be modified*.
	*
	* TODO: immutable proxy?
	*/
	toJSON() {
		return this.data;
	}

	/** Build a list from JSON.
	*
	* Used by various libs when converting a json stream into typed objects. (see typed-patch, db-plubming-mongo)
	*/
	static fromJSON(data) {
		return ImmutableList.from(data);
	}
}

/** Immutable Map extends AbstractMap to wrap an ES6 mutable map
 */
class ImmutableList extends AbstractList {

	/** Constructor
	*
	* If a map is passed in, simply wraps that map (so the resulting immutable map is basically
	* just a view on the parameter map). Otherwise, parameter is assumed to be an iterable over
	* key/value pairs (i.e. [[k,v]...])
	*
	* @param data Iterable over key/value pairs, Map, nothing (defauts to empty map)
	*/
	constructor(data = new Array()) {
		debug('ImmutableList.constructor', data);
		super();

		if (data instanceof Array) 
			this.data = data;
		else 
			this.data = Array.from(data);
	}

	/** buffer creates a mutable array as a copy of this array.
	*
	* buffer is invoked by the set and delete operations of AbstractList to create a mutable list for update.
	*/
	buffer() { return Array.from(this.data); }

	/** Get an iterator over values
	*/
	[Symbol.iterator]() {
		return this.data[Symbol.iterator]();
	}


}

/** BufferLazylist implemnents an lazily constructed immutable list.
*
*/
class BufferLazyList extends AbstractList {

	/** Constructor
	*
	* @param builder {Function} a function that builds a mutuable array to back this immutable list.
	*/
	constructor(builder) {
		super();
		this.buffer = builder;
	}

	/** Accessor to get underlying map data
	*
	* if builder has not already been invoked, invoke it and cache the result. 
	*
	* @return the cached result of invoking builder.
	*/
	get data() {
		if (!this._data) { 
			this._data = this.buffer();
			this.buffer = () => Array.from(this._data); 
		}
		return this._data; 
	}

    /** Get an iterator over values
	*/
	[Symbol.iterator]() {
		return this.data[Symbol.iterator]();
	}

	static from(builder) {
		return new Proxy(new BufferLazyList(builder), HANDLER);
	}
}

/** StreamLazylist implemnents an lazily constructed immutable list.
*
*/
class StreamLazyList extends AbstractList {

	/** Constructor
	*
	* @param builder {Function} a function that builds a stream to back this immutable list.
	*/
	constructor(builder) {
		super();
		this[Symbol.iterator] = builder;
	}

	/** Accessor to get underlying map data
	*
	* if builder has not already been invoked, invoke it and cache the result. 
	*
	* @return the cached result of invoking builder.
	*/
	get data() {
		if (!this._data) { 
			this._data = Stream.from(this).toArray();
			this[Symbol.iterator] = ()=>Stream.from(this._data);
		}
		return this._data; 
	}

	buffer() {
		return Array.from(this.data);
	}

	static from(builder) {
		return new Proxy(new StreamLazyList(builder), HANDLER);
	}
}

const HANDLER = {
	get(target, property) {
		if (property in target) return target[property];
		return target.get(property);
	},

	set(target, property) {
		throw new TypeError('Can\'t change an immutable type');
	}
}

ImmutableList.EMPTY = ImmutableList.from([]);

module.exports = ImmutableList;
