# Further Development Suggestions

[Back to README](README.md)

---
> **Authors:** *Tom A. S. Myre, Markus Nilsen, Marius Evensen, Sebastian Midtskogen & Lukas A. Andersen*
> **Date:** 02.05.2024

This document is intended to provide our insight on further devolpment after our handover. As a helping guide we will provide the suggestions on genral improvments, new features and expansions.

Defining the general structure of the suggestion, The topp line will consist of a title and a Type Category. Next will have two fields/keywords describing how difficult and our amount of reasearch & testing done. Below is a list of the categories and a short note on what we mean, further down is an example.

1. Type:

    * **Front-end** *(The Next.js application / website)*
    * **Back-end** *(The FastApi / processing / backend connected Services)*
    * **Fullstack** *(Encompassing both)*
    * **unknown** *(Unsure of where to place or the current types are not descriptive)*

2. Difficulity:

    * **Low** *(Reletivly easy, considering context)*
    * **Medium** *(Some difficulity expected/ time)*
    * **High** *(Expected high difficulity / high timeconsumption)*
    * **unknown** *(We can not place it/ we are unsure)*

3. Researched:

    * **None** *(Only based on our intuition, given our work with the project)*
    * **Low** *(Some testing and/or Reading some source)*
    * **Medium** *(Decent amount of testing and/or Reading Sources)*
    * **High** *(Good amount of testing and/or Good source reading)*

---

 **Example, Front-End:**
>
> * `Difficulity: Medium`
> * `Research: Medium`
>
> **Description**: what, why & possibly a theoretical suggested solution.

## High priority

Improvment

### Good Starter

## Medium priority

Improvments

### Good starters

## Low priority

## Unsorted

**Refactor ProjectHanlder, Back-End:**

> * `Difficulity: Medium`
> * `Research: low`
>
> **Description**: Seprate projecthandler into smaller classes. The Reasone for this is the current readablility of codebase and that currently the projecthandlerclass have to much resposebility.
>
> A Suggestion on our part would be to split out general point handeling to one class and handeling of georefenicing to another.
>
> A relational suggestion is to have the new georefrencing handler know of the project handler, which in turn uses point handler. The router will use all three.

**Point error calculation, Fullstack:**

> * `Difficulity: High`
> * `Research: Medium`
>
> **Description**: Calculates how far off your original points where from their real positions. This is supposed to be done when users adds more then the minimum amounts of points to a map for the goerefrence. This will then improved accuracy, and they would be able to see how far off their original marker placements where compared to the re-referenced points on the map.
>
> & possibly a theoretical suggested solution.

 **Suggested points, Fullstack:**
>
> * `Difficulity: High`
> * `Research: Medium`
>
> **Description**: With the inital georefrence, the software would suggest points on the map to be placed. This would greatly improve the user experience and the learning curve for new users of this kind of software. But this might be quite a difficult task as it would probably have to include some kind of artificial Intelligence to or advanced algorithm to achieve this at the level we want.
>
> In terms of an algorithm this would then most likely depend on different reworks like the error point calculations.
