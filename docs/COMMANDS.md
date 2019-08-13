# Collections

| URI | Description | Command |  
| <prefix>/collections | Collections in the library | |
| <prefix>/collections/top | Top-level collections in the library | |
| <prefix>/collections/<collectionKey> | A specific collection in the library | |
| <prefix>/collections/<collectionKey>/collections | Subcollections within a specific collection in the library | |

# Items

| URI | Description | Command |
| <prefix>/items | All items in the library, excluding trashed items | |
| <prefix>/items/top | Top-level items in the library, excluding trashed items | |
| <prefix>/items/trash | Items in the trash | |
| <prefix>/items/<itemKey> | A specific item in the library | |
| <prefix>/items/<itemKey>/children | Child items under a specific item | |
| <prefix>/publications/items | Items in My Publications | |
| <prefix>/collections/<collectionKey>/items | Items within a specific collection in the library | |
| <prefix>/collections/<collectionKey>/items/top | Top-level items within a specific collection in the library | |

#Searches
(Note: Only search metadata is currently available, not search results.)

# Tags
| URI | Description | Command |
| <prefix>/tags | All tags in the library | |
| <prefix>/tags/<url+encoded+tag> | Tags of all types matching a specific name | |
| <prefix>/items/<itemKey>/tags | Tags associated with a specific item | |
| <prefix>/collections/<collectionKey>/tags | Tags within a specific collection in the library | |
| <prefix>/items/tags | All tags in the library, with the ability to filter based on the items | |
| <prefix>/items/top/tags | Tags assigned to top-level items | |
| <prefix>/items/trash/tags | Tags assigned to items in the trash | |
| <prefix>/items/<collectionKey>/items/tags | Tags assigned to items in a given collection | |
| <prefix>/items/<collectionKey>/items/top/tags | Tags assigned to top-level items in a given collection | |
| <prefix>/publications/items/tags | Tags assigned to items in My Publications | |

# Other URLs
| URI | Description | Command |
| /keys/<key> | The user id and privileges of the given API key. | | | Use the DELETE HTTP method to delete the key. This should generally be done only by a client that created the key originally using OAuth. | |
| /users/<userID>/groups | The set of groups the current API key has access to, including public groups the key owner belongs to even if the key doesn't have explicit permissions for them. | |
