document.getElementById("authors").addEventListener("input", function(e)
{
    document.getElementById("file-name").innerHTML = this.value.split("\\").pop();
});

function search()
{
    if (document.getElementById("progress") == null)
    {
        if (document.getElementById("results") != null)
        {
            document.getElementById("center").removeChild(document.getElementById("results"));
        }

        let files = document.getElementById("authors").files;

        if (files.length == 0)
        {
            alert("No file selected.");
        }

        else
        {
            files[0].text().then(async (data) =>
            {
                let lines = data.split('\n');
                let ids = ["Student Last,Student First,Advisor Last,Advisor First,Student First Author"];

                let progress = document.createElement("p");

                progress.setAttribute("id", "progress");
                progress.innerHTML = `0 of ${lines.length} completed.`;

                document.getElementById("center").appendChild(progress);

                for (let i in lines)
                {
                    let split = lines[i].split(',').map((x) => x.trim());

                    await getIds(split[1], split[0], split[3], split[2], true, ids);
                    await getIds(split[1], split[0], split[3], split[2], false, ids);

                    progress.innerHTML = `${parseInt(i) + 1} of ${lines.length} completed.`;
                }

                document.getElementById("center").removeChild(progress);

                let download = document.createElement("a");

                download.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(ids.join("\n")));
                download.setAttribute("download", "results.csv");
                download.setAttribute("id", "results");
                download.innerHTML = "Download results";

                document.getElementById("center").appendChild(download);
            });
        }
    }
}

async function getIds(student_first, student_last, advisor_first, advisor_last, first_author, ids)
{
    if (student_first == undefined || student_last == undefined) return;

    let url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?tool=OSU_PubMed_Retriever&email=isaacbrown5763@gmail.com&api-key=ea9a2db47a29da803ed4e25b9327a5e01e08&db=pubmed&term=";
    
    if (advisor_first == "" || advisor_last == "")
    {
        url += `${student_first}%20${student_last}+${first_author ? "AND" : "NOT"}+${student_last},%20${student_first[0]}[1au]`;
    }

    else
    {
        url += `${student_first}%20${student_last}+AND+${advisor_first}%20${advisor_last}+${first_author ? "AND" : "NOT"}+${student_last},%20${student_first[0]}[1au]`;
    }

    let idElements = await fetch(url).then(x => x.text()).then(x => new window.DOMParser().parseFromString(x, "text/xml")).then(x => x.getElementsByTagName("Id"));

    for (let id of idElements)
    {
        ids.push(`${student_last},${student_first},${advisor_last},${advisor_first},${id.innerHTML},${first_author ? "TRUE" : "FALSE"}`);
    }

    await new Promise(resolve => setTimeout(resolve, 350));
}