const express = require('express');
const router = express.Router();
const helpers = require('../helpers/util')
const moment = require('moment');
const path = require('path');
// moment(item.date).format('YYYY-MM-DD')

module.exports = function(db){

  /* GET home page. */
  router.get('/projects', helpers.isLoggedIn, (req, res) => {
    // Find some documents
    const url = req.query.page ? req.url : 'projects/?page=1';
    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit
    let searching = false;
    let params = [];


    if (req.query.checkid && req.query.formid) {
      params.push(`tbl_projects.projectid = ${req.query.formid}`);
      searching = true;
    }
    if (req.query.checkname && req.query.formname) {
      params.push(`tbl_projects.name ilike '%${req.query.formname}%' `);
      searching = true;
    }
    if (req.query.checkmember && req.query.member) {
      params.push(`concat(tbl_users.firstname,' ', tbl_users.lastname)= '${req.query.member}'`);
      searching = true;
    }

    // untuk menghitung jumlah data  (pagination)  1 SELECT COUNT(id) AS
    let sql = `SELECT COUNT(id) AS total FROM (SELECT DISTINCT tbl_projects.projectid AS id FROM tbl_projects
      LEFT JOIN tbl_members ON tbl_projects.projectid = tbl_members.projectid
      LEFT JOIN tbl_users ON tbl_members.userid = tbl_users.userid`

      if (searching) {
        sql += ` WHERE ${params.join(' AND ')}`
      }
      // untuk menghitung jumlah data  (pagination)  2
      sql += `) AS project_member`
      console.log('count query', sql);

      db.query(sql, (err, data) => {
        const totalPages = data.rows[0].total
        const pages = Math.ceil(totalPages / limit)

        // Tampilan data dari tbl_projects saja
        sql = `SELECT DISTINCT tbl_projects.projectid, tbl_projects.name FROM tbl_projects
        LEFT JOIN tbl_members ON tbl_projects.projectid = tbl_members.projectid
        LEFT JOIN tbl_users ON tbl_members.userid = tbl_users.userid`

        if (searching) {
          sql += ` WHERE ${params.join(' AND ')}`
        }
        sql += ` ORDER BY tbl_projects.projectid LIMIT ${limit} OFFSET ${offset}`

        //Batas data query members berdasarkan project yang akan di olah saja
        let subquery = `SELECT DISTINCT tbl_projects.projectid FROM tbl_projects
        LEFT JOIN tbl_members ON tbl_projects.projectid = tbl_members.projectid
        LEFT JOIN tbl_users ON tbl_members.userid = tbl_users.userid`

        if (searching) {
          subquery += ` WHERE ${params.join(' AND ')}`
        }

        subquery += ` ORDER BY tbl_projects.projectid LIMIT ${limit} OFFSET ${offset}`
        // console.log('project list', subquery);

        //mendapat data members berdaarkan project
        let sqlMembers = `SELECT tbl_projects.projectid, CONCAT(tbl_users.firstname,' ',tbl_users.lastname) AS fullname
        FROM tbl_members
        INNER JOIN tbl_projects ON tbl_members.projectid = tbl_projects.projectid
        INNER JOIN tbl_users ON tbl_users.userid = tbl_members.userid
        WHERE tbl_projects.projectid IN (
          ${subquery})`;
          // console.log('load members', sqlMembers);
          db.query(sql, (err, projectData) => {
            db.query(sqlMembers, (err, memberData) => {
              projectData.rows.map(project => {
                project.members = memberData.rows.filter(member => {
                  return member.projectid == project.projectid
                }).map(item => item.fullname)
              })
              // console.log('Data Jadi', projectData.rows);
              //megambil semua data dari dari user untuk memilih semua members
              db.query(`SELECT CONCAT(firstname,' ',lastname) AS fullname FROM tbl_users ORDER BY fullname`, (err, userData) => {
                //opsi checkbox untuk menampilkan kolom di table
                db.query(`SELECT options_project -> 'opsi1' as opsi1, options_project -> 'opsi2' as opsi2, options_project -> 'opsi3' as opsi3 FROM tbl_users WHERE userid  = ${req.session.user}`,(err, data) => {
                  // console.log('dddddddddddddddddddddddddddddddddddddddddddddd',data.rows);
                  res.render('projects', {
                    opsi:data.rows[0],
                    query: req.query,
                    data:projectData.rows,
                    users: userData.rows,
                    pagination: {
                      pages,
                      page,
                      totalPages,
                      url
                    },
                    session : req.session.user,
                    status : req.session.status
                  })
                })
              });
            });
          });
        });
      });

      router.post('/projects', helpers.isLoggedIn, (req, res) => {

        if(!req.body.opsi1){
          req.body.opsi1 = false
        }
        if(!req.body.opsi2){
          req.body.opsi2 = false
        }
        if(!req.body.opsi3){
          req.body.opsi3 = false
        }

        let sql = `update tbl_users set options_project = options_project::jsonb || '{"opsi1" : ${req.body.opsi1}, "opsi2" : ${req.body.opsi2}, "opsi3" : ${req.body.opsi3}}' WHERE userid = ${req.session.user}`
        db.query(sql, (err, rows) => {
          res.redirect('projects')
        })
      });

      router.get('/profile', helpers.isLoggedIn, (req, res) => {
        let sql = `select * from tbl_users order by userid`
        db.query(sql, (err, rows) => {
          res.render('add', {data:rows.rows})
        });
      });

      router.get('/', (req, res)=>{
        if(req.session.user) {
          res.redirect('/projects');
        } else {
          res.render('login', {loginMessage: req.flash('loginMessage')});
        }
      });

      router.post('/', (req, res)=>{
        let sql = `select * from tbl_users where email='${req.body.email}' and password='${req.body.password}' `
        db.query(sql, (err, users)=>{
          if(err){
            res.send(err);
          }
          if(users.rowCount > 0){
            req.session.user = users.rows[0].userid
            req.session.status = users.rows[0].status
            res.redirect('/projects')
          }else{
            req.flash('loginMessage', 'Username or password invalid')
            res.redirect('/')
          }
        })
      })

      router.get('/addList', helpers.isLoggedIn, (req, res) => {
        let sql = `select * from tbl_users order by userid`
        db.query(sql, (err, rows) => {
          res.render('addList', {data:rows.rows, session : req.session.user, status : req.session.status})
        });
      });

      router.post('/addList', helpers.isLoggedIn, (req, res) => {
        let addId = req.body.id;
        let addPosition = req.body.position;
        let sql = `insert into tbl_projects (name) values ('${req.body.project_name}') RETURNING projectid `
        db.query(sql, (err, rows) => {
          if(addId) {
            for (var i = 0; i < addId.length; i++) {
              let sql1 = `insert into tbl_members (userid, projectid) values (${addId[i]}, ${rows.rows[0].projectid})`
              db.query(sql1, (err) => {
                if(err) throw err;
              })
            }
            res.redirect('addList')
          } else {
            let sql1 = `insert into tbl_members (projectid) values (${rows.rows[0].projectid})`
            db.query(sql1, (err) => {
              if(err) throw err;
              res.redirect('addList')
            })
          }
        });
      });

      router.get('/updateList/:id', helpers.isLoggedIn, (req, res) =>{
        console.log(req.params.id)
        db.query(`select * from tbl_projects where projectid = ${req.params.id}`, (err, projectData) => {
          if (err) return res.send(err);
          db.query(`select userid from tbl_members where projectid = ${req.params.id}`, (err, memberData) => {
            if (err) return res.send(err)
            db.query(`select userid, firstname, lastname from tbl_users order by userid = ${req.params.id}`, (err, userData) => {
              if (err) return res.send(err)
              console.log(memberData.rows);
              res.render('updateList', {
                project : projectData.rows[0],
                members : memberData.rows.map(item => item.userid), // [1,2,3]
                users : userData.rows,
                session : req.session.user,
                status : req.session.status
              });
            });
          });
        });
      });

      router.post('/updateList/:id', helpers.isLoggedIn, (req, res) =>{
        let sql = `delete from tbl_members where projectid = ${req.params.id}`
        db.query(sql, (err) => {
          if (err) return res.send(err)
          if (req.body.users) {
            // select projectid from projects order by projectid desc limit 1
            db.query(`select max(projectid) from tbl_projects`, (err, latestId) => {
              if (err) return res.send(err)
              let projectId = latestId.rows[0].max;
              if (Array.isArray(req.body.users)) {
                let values = [];
                req.body.users.forEach((item) => {
                  values.push(`(${req.params.id}, ${item.split("#")[0]})`);
                })
                let sqlMembers = `insert into tbl_members (projectid, userid) values `
                sqlMembers += values.join(', ')
                console.log("query buat masukin members", sqlMembers);
                db.query(sqlMembers, (err) => {
                  if (err) return res.send(err)
                  res.redirect('/projects');
                });
              } else {
                db.query(`insert into tbl_members (projectid, userid) values (${req.params.id}, ${req.body.users.split("#")[0]})`, (err) => {
                  if (err) return res.send(err)
                  res.redirect('/projects');
                });
              }
            })

          } else {
            res.redirect('/projects');
          }
        })
      });

      router.get('/deleteList/:id', helpers.isLoggedIn, (req, res) => {
        let sql = `delete from tbl_members where projectid = ${req.params.id}`
        db.query(sql, (err) => {
          if (err) return res.send(err)
          let sql1 = `delete from tbl_projects where projectid = ${req.params.id}`
          db.query(sql1, (err) => {
            if (err) return res.send(err)
            console.log('Delete')
            res.redirect('/');
          })
        })
      });

      // profile
      router.get('/profile/:id', helpers.isLoggedIn, (req, res) => {
        let sql = `select * from tbl_users where userid = ${req.params.id}`;
        db.query(sql, (err, rows) => {
          res.render('profile', { data: rows.rows[0], session : req.session.user, status : req.session.status})
        });
      });

      router.post('/profile/:id', helpers.isLoggedIn, (req, res) => {
        if (!req.body.fulltime == 1) {
          req.body.fulltime = 0
        }
        if(req.body.formpass !== 'undefined' && req.body.formpass !==  '') {
          let sql = `update tbl_users set password='${req.body.formpass}', role = '${req.body.gridRadios}', type = ${req.body.fulltime} where userid = '${req.params.id}'`
          db.query(sql, (err, rows) => {
            res.redirect(`/profile/${req.params.id}`)
          });
        } else {
          let sql = `update tbl_users set  position = '${req.body.gridRadios}', type = ${req.body.fulltime} where userid = '${req.params.id}'`
          db.query(sql, (err, rows) => {
            res.redirect(`/profile/${req.params.id}`)
          });
        }
      });



      //Members start ----------------------------------------------------------------------------------------------------
      //Members start ----------------------------------------------------------------------------------------------------
      //Members start ----------------------------------------------------------------------------------------------------

      router.get('/projects/:id/project_detail_page_members', helpers.isLoggedIn, (req, res) => {

        const url = req.query.page ? req.url : '?page=1';
        const page = req.query.page || 1;
        const limit = 10;
        const offset = (page -1) * limit
        let searching = false;
        let params = [];

        req.query.page ? req.query.opsi1 : req.query.opsi1 = true
        req.query.page ? req.query.opsi2 : req.query.opsi2 = true
        req.query.page ? req.query.opsi3 : req.query.opsi3 = true

        let sql = `select tbl_users.userid, tbl_users.firstname, tbl_members.role, tbl_members.id from tbl_members inner join tbl_projects on tbl_members.projectid = tbl_projects.projectid inner join tbl_users on tbl_members.userid = tbl_users.userid where tbl_members.projectid = ${req.params.id}`

        if (req.query.checkid && req.query.formid) {
          params.push(` tbl_members.projectid = ${req.query.formid}`)
          searching = true
        }
        if (req.query.checkname && req.query.formname){
          params.push(` tbl_users.firstname ilike '%${req.query.formname}%'`)
          searching = true
        }
        if (req.query.checkposision && req.query.formposision) {
          params.push(` tbl_members.role = '${req.query.formposision}'`)
          searching = true
        }

        if (searching) {
          sql += ` and ${params.join(' and ')}`
        }

        db.query(sql, (err, listData) => {
          if (err) return res.send(err)

          sql =`SELECT options_project -> 'opsi1' as opsi1, options_project -> 'opsi2' as opsi2, options_project -> 'opsi3' as opsi3 FROM tbl_users WHERE userid  = ${req.session.user} `
          db.query(sql,(err, data) => {

            res.render('project_detail_page_members', {
              session : req.session.user,
              data : listData.rows,
              query : req.query,
              params : req.params.id,
              status : req.session.status
            })
          })
        })
      })

      router.get('/projects/:id/updateMembers/:idUser', helpers.isLoggedIn, (req, res) =>{
        sql = `select tbl_members.id, tbl_users.userid ,concat(tbl_users.firstname,' ',tbl_users.lastname), tbl_members.role,  tbl_projects.name
        from tbl_members
        inner join tbl_projects on tbl_members.projectid = tbl_projects.projectid
        inner join tbl_users on tbl_members.userid = tbl_users.userid where tbl_members.projectid = ${req.params.id} and tbl_members.userid = ${req.params.idUser} order by tbl_members.id `
        db.query(sql, (err, updateMembers) => {
          if (err) return res.send(err)
          res.render('updateMembers', {data : updateMembers.rows[0], session : req.session.user})
        })
      });


      router.post('/projects/:id/updateMembers/:idUser', helpers.isLoggedIn, (req, res) =>{
        sql = `update tbl_members set role = '${req.body.role}' where projectid = ${req.params.id} and userid = ${req.params.idUser}`;
        console.log(sql);
        db.query(sql, (err, updateMembers) => {
          if (err) return res.send(err);
          res.redirect(`/projects/${req.params.id}/project_detail_page_members`);
        });
      });

      router.get('/projects/:id/deleteMembers/:idUser', helpers.isLoggedIn, (req, res) =>{
        sql = `delete from tbl_members where id = ${req.params.idUser}`
        console.log(sql);
        db.query(sql, (err, updateMembers) => {
          if (err) return res.send(err);
          res.redirect(`/projects/${req.params.id}/project_detail_page_members`);
        });
      });

      router.get('/projects/:id/addMembers', helpers.isLoggedIn, (req, res) =>{
        sql = `select * from tbl_users`
        db.query(sql, (err, usersData) => {

          sql = `select userid from tbl_members where projectid = ${req.params.id}`
          db.query(sql, (err, memberData) => {

            res.render('addMembers', {
              session : req.session.user,
              users: usersData.rows,
              members : memberData.rows.map(item => item.userid),
              status : req.session.status
            });
          });
        });
      });

      router.post('/projects/:id/addMembers', helpers.isLoggedIn, (req, res) =>{
        sql = `insert into tbl_members (userid, projectid, role) values (${req.body.members}, ${req.params.id}, '${req.body.formposision}')`
        db.query(sql, (err) => {
          res.redirect('addMembers')
        })
      });



      //Members End ----------------------------------------------------------------------------------------------------
      //Members End ----------------------------------------------------------------------------------------------------
      //Members End ----------------------------------------------------------------------------------------------------


      //Issues ----------------------------------------------------------------------------------------------------
      //Issues ----------------------------------------------------------------------------------------------------
      //Issues ----------------------------------------------------------------------------------------------------

      router.get('/projects/:id/project_detail_page_issues', helpers.isLoggedIn, (req, res) => {

        const url = req.query.page ? req.url : '?page=1';
        const page = req.query.page || 1;
        const limit = 10;
        const offset = (page -1) * limit
        let searching = false;
        let params = [];

        req.query.page ? req.query.opsi1 : req.query.opsi1 = true
        req.query.page ? req.query.opsi2 : req.query.opsi2 = true
        req.query.page ? req.query.opsi3 : req.query.opsi3 = true

        let sql = `select issueid, subject, tracker from tbl_issues where projectid = ${req.params.id}`

        if (req.query.checkid && req.query.formid) {
          params.push(` issueid = ${req.query.formid}`)
          searching = true
        }
        if (req.query.checkname && req.query.formname) {
          params.push(` subject ilike '%${req.query.formname}%'`)
          searching = true
        }
        if (req.query.checkposision && req.query.formposision) {
          params.push(` tracker = '${req.query.formposision}'`)
          searching = true
        }

        if (searching) {
          sql += ` and ${params.join(' and ')}`
        }

        db.query(sql, (err, listData) => {
          if (err) return res.send(err)

          sql =`SELECT options_project -> 'opsi1' as opsi1, options_project -> 'opsi2' as opsi2, options_project -> 'opsi3' as opsi3 FROM tbl_users WHERE userid  = ${req.session.user} `
          db.query(sql,(err, data) => {

            res.render('project_detail_page_issues', {
              session : req.session.user,
              data : listData.rows,
              query : req.query,
              params : req.params.id,
              status : req.session.status
            })
          })
        })
      })


      router.get('/projects/:id/addIssues', helpers.isLoggedIn, (req, res) => {
        let sql = `select concat(firstname,' ',lastname) as assignee, userid from tbl_users where userid = ${req.session.user}`
        db.query(sql, (err, data) => {
          res.render(`addIssues`, {session : req.session.user, data : data.rows[0], params : req.params.id, status : req.session.status})
        });
      })

      router.post('/projects/:id/addIssues/', helpers.isLoggedIn, (req, res) => {
        let file = req.files.filedoc;
        let filename = file.name.toLowerCase().replace('', Date.now());
        let updateDate = moment().toDate();
        let time = moment(updateDate).format('h:mm:ss a')

        if (req.files) {
          console.log(filename);
          file.mv(path.join(__dirname, `../public/file_upload/${filename}`), function (err) {
            if (err) console.log(err)
          })
        }

        sql = `insert into tbl_issues (projectid, tracker, subject, description, status, priority, assignee, startDate, dueDate, estimatedTime, done, files) values (${req.params.id}, '${req.body.tracker}', '${req.body.subject}', '${req.body.description}', '${req.body.status}', '${req.body.priority}' ,'${req.body.assignee}', '${req.body.startDate}', '${req.body.dueDate}', ${req.body.estimatedTime}, ${req.body.done}, '${filename}')`
        console.log(sql);
        let sql1 = `select max(issueid + 1) from tbl_issues`
        db.query(sql1, (err, latestId) => {
          db.query(sql, (err) => {
            if (err) return res.send(err);
            let sqlA = `insert into tbl_activity (title, description, author, projectid ) values ('Update Issue :${time} ${req.body.subject} ${req.body.tracker} #${req.params.idUser} ${req.body.status}', '${req.body.description}', ${req.session.user}, ${req.params.id})`;
            console.log(sqlA);
            db.query(sqlA, (err) => {
              if (err) return res.send(err);
              res.redirect('project_detail_page_issues')

            })
          })
        });
      });

      router.get('/projects/:id/updateIssues/:idUser', helpers.isLoggedIn, (req, res) =>{
        sql = `select * from tbl_issues where issueid = ${req.params.idUser} `
        db.query(sql, (err, updateMembers) => {
          if (err) return res.send(err)
          sql = `select tbl_users.userid, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_members inner join tbl_projects on tbl_members.projectid = tbl_projects.projectid inner join tbl_users on tbl_members.userid = tbl_users.userid where tbl_members.projectid = ${req.params.id} order by fullname`;
          db.query(sql, (err, fullname) => {
            if (err) return res.send(err)
            res.render('updateIssues', {data : updateMembers.rows[0], fullname : fullname.rows , session : req.session.user, params : req.params.id, moment, user :  req.params.idUser, status : req.session.status})
          })
        });
      });

      router.post('/projects/:id/updateIssues/:idUser', helpers.isLoggedIn, (req, res) =>{
        let updateDate = moment().toDate();
        let date = moment(updateDate).format('YYYY-MM-DD')
        let time = moment(updateDate).format('h:mm:ss a')
        if (req.files.filedoc) {

          let file = req.files.filedoc;
          let filename = file.name.toLowerCase().replace('', Date.now());

          if (req.files) {
            file.mv(path.join(__dirname, `../public/file_upload/${filename}`), function (err) {
              if (err) console.log(err)
            })
          }

        }else{
          filename = false
        }


        sql = `update tbl_issues set
        tracker = '${req.body.tracker}',
        subject = '${req.body.subject}',
        description = '${req.body.description}',
        status = '${req.body.status}',
        priority = '${req.body.priority}',
        assignee = ${req.body.assignee},
        startdate = '${req.body.startDate}',
        duedate = '${req.body.dueDate}',
        estimatedtime = ${req.body.estimatedTime},
        done = ${req.body.done},
        spenttime = ${req.body.spentTime},
        targetversion = '${req.body.targetVersion}',
        author = ${req.session.user},
        updateddate = '${date}',
        parenttask = ${req.params.idUser}`
        console.log(filename);

        if (filename ) {
          sql +=`  files = '${filename}'`
        }

        if (req.body.closeDate !== '') {
          sql += `, closedate = '${req.body.closeDate}' where issueid = ${req.params.idUser}`
        } else {
          sql += ` where issueid = ${req.params.idUser}`
        }

        console.log(sql);
        db.query(sql, (err) => {

          if (err) return res.send(err);
          let sqlA = `insert into tbl_activity (title, description, author, projectid ) values ('Update Issue :${time} ${req.body.subject} ${req.body.tracker} #${req.params.idUser} ${req.body.status}', '${req.body.description}', ${req.session.user}, ${req.params.id})`;
          db.query(sqlA, (err) => {
            if (err) return res.send(err);
            res.redirect(`/projects/${req.params.id}/project_detail_page_issues`);
          });
        });
      });

      router.get('/projects/:id/deleteIssues/:idUser', helpers.isLoggedIn, (req, res) =>{
        let updateDate = moment().toDate();
        let time = moment(updateDate).format('h:mm:ss a')

        let sqlA = `insert into tbl_activity (title, description, author, projectid ) values ('Delete Issue :${time} ${req.body.subject} ${req.body.tracker} #${req.params.idUser} ${req.body.status}', '${req.body.description}', ${req.session.user}, ${req.params.id})`;
        db.query(sqlA, (err) => {
          if (err) return res.send(err);
          sql = `delete from tbl_issues where issueid = ${req.params.idUser}`
          console.log(sql);
          db.query(sql, (err, updateMembers) => {
            if (err) return res.send(err);
            res.redirect(`/projects/${req.params.id}/project_detail_page_issues`);
          });
        });
      });

      //Issues ----------------------------------------------------------------------------------------------------
      //Issues ----------------------------------------------------------------------------------------------------
      //Issues ----------------------------------------------------------------------------------------------------


      router.get('/projects/:id/project_detail_page_overview', helpers.isLoggedIn, (req, res) => {
        let bug = `select count(tracker) as total from tbl_issues where projectid = ${req.params.id} and tracker = 'bug'`
        db.query(bug, (err, bug) => {
          if (err) return res.send(err)

          let feature = `select count(tracker) as total from tbl_issues where projectid = ${req.params.id} and tracker = 'feature'`
          db.query(feature, (err, feature) => {
            if (err) return res.send(err)

            let support = `select count(tracker) as total from tbl_issues where projectid = ${req.params.id} and tracker = 'support'`
            db.query(support, (err, support) => {
              if (err) return res.send(err)

              let bug1 = `select count(closedate) as total from tbl_issues where projectid = ${req.params.id} and tracker = 'bug'`
              db.query(bug1, (err, bug1) => {
                if (err) return res.send(err)

                let feature1 = `select count(closedate) as total from tbl_issues where projectid = ${req.params.id} and tracker = 'feature'`
                db.query(feature1, (err, feature1) => {
                  if (err) return res.send(err)

                  let support1 = `select count(closedate) as total from tbl_issues where projectid = ${req.params.id} and tracker = 'support'`
                  db.query(support1, (err, support1) => {
                    if (err) return res.send(err)

                    sql = `select concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_members inner join tbl_projects on tbl_members.projectid = tbl_projects.projectid inner join tbl_users on tbl_members.userid = tbl_users.userid where tbl_members.projectid = ${req.params.id}`
                    db.query(sql, (err, membersData) => {

                      res.render('project_detail_page_overview', {
                        session : req.session.user,
                        bug1 : bug1.rows[0],
                        feature1 : feature1.rows[0],
                        support1 : support1.rows[0],
                        bug : bug.rows[0],
                        feature : feature.rows[0],
                        support : support.rows[0],
                        users : membersData.rows,
                        status : req.session.status
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })


      router.get('/projects/:id/project_detail_page_activity', helpers.isLoggedIn, (req, res) => {

        let set7Dates = helpers.get7Dates();
        let set7Days = helpers.get7Days();

        let sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[0]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
        db.query(sql, (err, dateOne) => {
          if (err) return res.send(err)
          sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[1]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
          db.query(sql, (err, dateTwo) => {
            if (err) return res.send(err)

            sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[2]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
            db.query(sql, (err, dateThree) => {
              if (err) return res.send(err)
              sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[3]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
              db.query(sql, (err, dateFour) => {
                if (err) return res.send(err)

                sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[4]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
                db.query(sql, (err, dateFive) => {
                  if (err) return res.send(err)
                  sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[5]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
                  db.query(sql, (err, dateSix) => {
                    if (err) return res.send(err)

                    sql = `select tbl_activity.*, concat(tbl_users.firstname,' ',tbl_users.lastname) as fullname from tbl_activity inner join tbl_users on tbl_activity.author = tbl_users.userid where time::date =  '${set7Dates[6]}' and tbl_activity.projectid = ${req.params.id} order by tbl_activity.activityid`
                    db.query(sql, (err, dateSeven) => {
                      if (err) return res.send(err)


                      res.render(`project_detail_page_activity`, {
                        session : req.session.user, set7Dates, set7Days,
                        dateOne : dateOne.rows,
                        dateTwo : dateTwo.rows,
                        dateThree : dateThree.rows,
                        dateFour : dateFour.rows,
                        dateFive : dateFive.rows,
                        dateSix : dateSix.rows,
                        dateSeven : dateSeven.rows,
                        status : req.session.status
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })



      router.get('/projects/:id/project_detail_page_issues', helpers.isLoggedIn, (req, res) => {

        res.render('project_detail_page_issues', {session : req.session.user, status : req.session.status})
      })









      router.get('/users/:id', helpers.isLoggedIn, (req, res) => {
        let sql = `select * from tbl_users order by userid`;
        db.query(sql, (err, rows) => {
          res.render('users', { data: rows.rows, session : req.session.user, status : req.session.status})
        });
      });

      router.get('/addUser', helpers.isLoggedIn, (req, res) => {
        res.render('addUser', {session : req.session.user, status : req.session.status})
      });

      router.post('/addUser', helpers.isLoggedIn, (req, res) => {
        let sql = `insert into tbl_users (email, firstname, lastname, password) values ('${req.body.email}','${req.body.firstname}','${req.body.lastname}','${req.body.password}')`;
        db.query(sql, (err, rows) => {
          res.redirect('users')
        });
      });


      router.post('/deleteUser/:id', helpers.isLoggedIn, (req, res) => {
        let sql = `delete from tbl_members where userid = ${req.params.id}`;
        db.query(sql, (err, rows) => {
          let sql1 = `delete from tbl_users where userid = ${req.params.id}`;
          db.query(sql1, (err, rows) => {
            res.redirect('users')
          });
        });
      });



      router.post('/users/:id', helpers.isLoggedIn, (req, res) => {
        if (!req.body.fulltime == 1) {
          req.body.fulltime = 0
        }
        if(req.body.formpass !== 'undefined' && req.body.formpass !==  '') {
          let sql = `update tbl_users set password='${req.body.formpass}', role = '${req.body.gridRadios}', type = ${req.body.fulltime} where userid = '${req.params.id}'`
          db.query(sql, (err, rows) => {
            res.redirect(`/profile/${req.params.id}`)
          });
        } else {
          let sql = `update tbl_users set  position = '${req.body.gridRadios}', type = ${req.body.fulltime} where userid = '${req.params.id}'`
          db.query(sql, (err, rows) => {
            res.redirect(`/users/${req.params.id}`)
          });
        }
      });


      return router;
    }
