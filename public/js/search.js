const searchInput = document.getElementById('search-input');

// Set up an event listener to listen for changes to the search input field
searchInput.addEventListener('input', () => {
    // Retrieve the search query from the input field
    const query = searchInput.value;
    const nationFilter = document.getElementById('nationFilter').value;
    const positionFilter = document.getElementById('positionFilter').value;
    // Send an AJAX request to the server with the search query
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/players/search');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`search=${encodeURIComponent(query)}&nationFilter=${encodeURIComponent(nationFilter)}&positionFilter=${encodeURIComponent(positionFilter)}`);

    // Handle the response from the server
    xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
            // Parse the JSON response
            const results = JSON.parse(xhr.responseText);
            console.log(results);
            // Update the web page with the search results
            updateSearchResults(results);
        } else {
            console.error('Search failed');
            // updateSearchResults(query);
        }
    });
});

// Update the web page with the search results
function updateSearchResults(results) {
        const template = ejs.compile(`
        <table class="table">
                        <tbody>
                            <thead>
                                <tr>
                                    <th scope="col">Image</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Nation</th>
                                    <th scope="col">Club</th>
                                    <% if(checkAdmin){%>
                                    <th scope="col">Actions</th>
                                    <% } %>
                                </tr>
                            </thead>
                            <% player.forEach(function(player){%>

                            <tr href="/players/details/<%= player._id%>">
                                <th scope="row"><img class="rounded" src=<%=player.image %>>
                                </th>
                                <td>
                                    <%= player.name %>
                                </td>
                                <td>
                                    <img src="<%= (player.nation) ? (player.nation.image) : '' %>" alt=""
                                        class="player-nation">
                                </td>
                                <td>
                                    <%= player.club %>
                                </td>
                                <% if(checkAdmin){%>
                                <td>
                                    <div class="buttons are-small">
                                        <button type="button" class="button is-warning is-light"
                                            onclick="editFunction( < %= player.id % > )">Edit</button>
                                        <button class="button is-danger is-light" type="button"
                                            onclick="deleteFunction( < %= player.id % > )">Delete</button>
                                    </div></a>
                                </td>
                                <% } %>
                                <!-- <td>
                                                            <div class="buttons">
                                                                <div class="dropdown">
                                                                    <button class="btn btn-success" type="button"
                                                                        id="dropdownMenuButton1"
                                                                        data-bs-toggle="dropdown" aria-expanded="false">
                                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                                            width="16" height="16" fill="currentColor"
                                                                            class="bi bi-three-dots"
                                                                            viewBox="0 0 16 16">
                                                                            <path
                                                                                d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                                                        </svg>
                                                                    </button>
                                                                    <ul class="dropdown-menu"
                                                                        aria-labelledby="dropdownMenuButton1">
                                                                        <li>
                                                                            <a class="btn detail-btn"
                                                                                href="/players/details/<%= player._id%>">Details</a>
                                                                        </li>
                                                                        <% if(checkAdmin){%>
                                                                            <li>
                                                                                <a class="btn edit-btn"
                                                                                    href="/players/edit/<%= player._id%>">Edit</a>
                                                                            </li>
                                                                            <li>
                                                                                <a class="btn delete-btn"
                                                                                    onclick="deleteFunction('<%=player._id%>')">Delete
                                                                                </a>
                                                                            </li>
                                                                            <% } %>
                                                                    </ul>
                                                                </div>
                                                            </div> -->
                                <!-- </td> -->
                            </tr>
                            <%})%>
                        </tbody>
                    </table>
                    <form class="form-inline my-2 my-lg-0" method="get" action="/players">
                        <input hidden name="search" value="<%= (typeof(search) == 'undefined') ? '' : search %>">
                        <ul class="pagination me-auto">
                            <li class="page-item page-pre <%= page == 1 ? 'disabled' : '' %>"><a class="page-link"
                                    aria-label="previous page" onclick="redirectPage(page)">‹</a>
                            </li>
                            <li class="page-item"><a class="page-link" aria-label="to page 1"
                                    onclick="redirectPage(1)">1</a>
                            </li>
                            <!-- <li class="page-item"> -->
                            <%if (maxPage > 2) {%>
                            <input class="page-item"
                                style="width: 40px; text-align: center; margin-right: 1px; border: var(--bs-pagination-border-width) solid var(--bs-pagination-border-color)"
                                type="number" name="page" min="2" placeholder="..." max="<%= parseInt(maxPage)-1%>"
                                onkeypress="search(this)" value="<%= page != 1 && page != maxPage ? page : '' %>">
                            <%}%>
                            <input type="submit" hidden />
                            <%if (maxPage > 1) {%>
                            <li class="page-item"><a class="page-link" aria-label="to page 80"
                                    onclick="redirectPage('<%= maxPage %>')"><%= maxPage %></a>
                            </li>
                            <%}%>
                            <li class="page-item page-next <%= page == maxPage ? 'disabled' : '' %>"><a
                                class="page-link" aria-label="next page"
                                onclick="redirectPage(parseInt(page) + 1)">›</a>
                            </li>
                        </ul>
                    </form>
  `);


    const html = template({
        ...results
    });

    document.getElementById("test").innerHTML = html;
}