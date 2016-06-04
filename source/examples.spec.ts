/// <reference path="index.ts" />
import {AureliaLinter, Config} from './aurelia-linter';



describe("Aurelia Examples", () => {

    var config: Config = new Config();
    
    config.obsoleteTags.push('my-old-tag');
    
    var linter: AureliaLinter = new AureliaLinter(config);
    
     it("readme example'", (done) => {
        var html = `<template>
    <require/>
    <require frm="bad"/>
    <require from="good"/>
    
    <div repeat="item of items"/>
    <div repeat.for="item of"/>
    
    <slot></slot>
    <slot></slot> 
       
    <template>
        nested templates are bad under aurelia
    </template>   
</etemps> <!-- oops! -->`
        linter.lint(html)
            .then((errors) => {    
                
                errors = errors.sort((a,b)=> a.line - b.line);          
                errors.forEach(error => {
                    //console.log(error.message + " [ ln: " + error.line + " col: " + error.column +" ]" );
                });
                done();
            });
    });
    
    it("linter allows configerable obsolete tag", (done) => {
        var html = `
            <template>
                <my-old-tag></my-old-tag>
            </template>                  
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(1);
                expect(errors[0].message).toBe("<my-old-tag> is obsolete");
                done();
            });
    });

    it("linter okay with 'A Simple Template'", (done) => {
        var html = `
            <template>
                <div>Hello World!</div>
            </template>                  
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(0);
                done();
            });
    });

    it("linter okay with 'Requiring Resources'", (done) => {
        var html = `
            <template>
            <require from='nav-bar'></require>

            <nav-bar router.bind="router"></nav-bar>

            <div class="page-host">
                <router-view></router-view>
            </div>
            </template>  
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(0);
                done();
            });
    });

    it("linter not okay with 'Illegal Table Code '", (done) => {
        var html = `
            <template>
            <table>
                <template repeat.for="customer of customers">
                <td>\${customer.fullName}</td>
                </template>
            </table>
            </template>
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBeGreaterThan(0);
                done();
            });
    });

    it("linter okay with 'Correct Table Code'", (done) => {
        var html = `
            <template>
            <table>
                <tr repeat.for="customer of customers">
                <td>\${customer.fullName}</td>
                </tr>
            </table>
            </template>
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(0);
                done();
            });
    });


    it("linter not okay with 'Illegal Select Code'", (done) => {
        var html = `
            <template>
            <select>
                <template repeat.for="customer of customers">
                <option>...</option>
                </template>
            </select>
            </template> `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBeGreaterThan(0);
                done();
            });
    });

    it("linter okay with 'Correct Select Code'", (done) => {
        var html = `  
            <template>
            <select>
                <option repeat.for="customer of customers">...</option>
            </select>
            </template>
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(0);
                done();
            });
    });
    
     it("complains about obsolete <content>'", (done) => {
        var html = `  
            <template>
            <content>
            </content>
            </template>
            `
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(1);
                expect(errors[0].message).toBe("<content> is obsolete");
                done();
            });
    });
});