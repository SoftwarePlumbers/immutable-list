const ImmutableList = require( '../src/list');
const chai = require('chai');
const debug = require('debug')('immutable-list~tests');
const expect = chai.expect;

function withDebug(a) { debug(a); return a; }

const TEST_DATA = [ 1,1,2,3,5,8,13,21,34,55,89 ];

describe('ImmutableList', () => {

    it('can concatenate lists', () => {
        expect(Array.from(ImmutableList.from(TEST_DATA).concat(TEST_DATA))).to.deep.equal(TEST_DATA.concat(TEST_DATA));
    });

    it('can access elements through [] operator', () => {
        const list = ImmutableList.from(TEST_DATA);
        for (let i = 0; i < TEST_DATA.length; i++)
            expect(list[i]).to.equal(TEST_DATA[i]);
    });


    it('supports basic list fuctions', () => {
       	let list = new ImmutableList(TEST_DATA);
        expect(Array.from(list.entries())).to.deep.equal(Array.from(TEST_DATA.entries()));
        expect(list.values().toArray()).to.deep.equal(TEST_DATA);
        expect(list.keys().toArray()).to.deep.equal(Array.from(TEST_DATA.keys()));
        TEST_DATA.forEach((v,i)=>expect(list.get(i)).to.equal(v));
        TEST_DATA.forEach((v)=>expect(list.includes(v)).to.be.true);
        expect(list.get(999)).to.be.undefined;
        expect(list.includes(999)).to.be.false;
        let res = [];
        list.forEach(v=>res.push(v));
        expect(res).to.deep.equal(TEST_DATA);
        let count = 0;
        for (entry of list) {
        	expect(entry).to.equal(TEST_DATA[count++]);
        }
        expect(count).to.equal(TEST_DATA.length);
    });

    it('supports immutable set', () => {
    	let list1 = new ImmutableList(TEST_DATA);
    	let list2 = list1.set(4,99);
    	expect(list1.get(4)).to.equal(5);
    	expect(list2.get(4)).to.equal(99);
    });

    it('supports immutable delete', () => {
        let list1 = new ImmutableList(TEST_DATA);
        let list2 = list1.delete(4);
        expect(list1.get(4)).to.equal(5);
        expect(list2.get(4)).to.equal(undefined);
    });

    it('supports filter', ()=>{
        expect(ImmutableList.from(TEST_DATA).filter(e=>e>10).buffer()).to.deep.equal(TEST_DATA.filter(e=>e>10));        
    });

    it ('supports map', ()=>{
        expect(ImmutableList.from(TEST_DATA).map(e=>e*10).buffer()).to.deep.equal(TEST_DATA.map(e=>e*10));
    });

    it ('supports reduce', ()=>{
        expect(ImmutableList.from(TEST_DATA).reduce((v,e)=>v+e,0)).to.equal(TEST_DATA.reduce((v,e)=>v+e, 0));
    });

    it ('can do "every" test', ()=>{
        expect(ImmutableList.from(TEST_DATA).every(e=>e<100)).to.be.true;
        expect(ImmutableList.from(TEST_DATA).every(e=>e<50)).to.be.false;
    });

    it ('forEach visits every member', ()=>{

        let count = 0;
        ImmutableList.from(TEST_DATA).forEach((e)=> {
            expect(e).to.equal(TEST_DATA[count]);
            count++
        });
        expect(count).to.equal(TEST_DATA.length);
    });

    it('can convert items to entries', ()=>{
        expect(Array.from(ImmutableList.from(TEST_DATA).entries())).to.deep.equal(Array.from(TEST_DATA.entries()));
    });

    it('supports find', ()=>{
        expect(ImmutableList.from(TEST_DATA).find(e => e === 13)).to.equal(13);
        expect(ImmutableList.from(TEST_DATA).find(e => e === 7)).to.be.undefined;
    });

    it('supports findIndex', ()=>{
        expect(ImmutableList.from(TEST_DATA).findIndex(e => e === 13)).to.equal(TEST_DATA.findIndex(e => e === 13));
        expect(ImmutableList.from(TEST_DATA).findIndex(e => e === 7)).to.equal(-1);      
    });

    it('supports includes', ()=>{
        expect(ImmutableList.from(TEST_DATA).includes(13)).to.be.true;
        expect(ImmutableList.from(TEST_DATA).includes(7)).to.be.false;               
    });

    it('supports indexOf', ()=>{
        expect(ImmutableList.from(TEST_DATA).indexOf(13)).to.equal(TEST_DATA.indexOf(13));
        expect(ImmutableList.from(TEST_DATA).indexOf(13,7)).to.equal(-1);
    });

    it('supports slice', ()=>{
        expect(ImmutableList.from(TEST_DATA).slice(2,6).buffer()).to.deep.equal(TEST_DATA.slice(2,6));
    });

    it('supports join', ()=>{
        expect(ImmutableList.from(TEST_DATA).join(',')).to.equal(TEST_DATA.join(','));
    });

    it('supports push', ()=>{
        let expected = Array.from(TEST_DATA);
        expected.push('77','88','99');
        expect(ImmutableList.from(TEST_DATA).push('77','88','99').buffer()).to.deep.equal(expected);
    });

    it('supports some', ()=>{
        expect(ImmutableList.from(TEST_DATA).some(e => e === 13)).to.be.true;
        expect(ImmutableList.from(TEST_DATA).some(e => e === 6)).to.be.false;
    });
});